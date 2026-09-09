import { expect, request as apiRequest, test } from '@playwright/test';

const skillAuraBaseURL = 'http://localhost:4173';
const examPortalBaseURL = 'http://localhost:3000';
const sameOriginHeaders = { Origin: skillAuraBaseURL };

const users = {
  student: { email: 'demo@student.skillaura', password: 'demo-access', role: 'student' },
  employee: { email: 'demo@student.skillaura', password: 'demo-access', role: 'employee' },
  tutor: { email: 'demo@tutor.skillaura', password: 'demo-access', role: 'tutor' },
};

async function createLaunch(role: keyof typeof users) {
  const skillAura = await apiRequest.newContext({ baseURL: skillAuraBaseURL });
  const login = await skillAura.post('/api/auth/login', { data: users[role], headers: sameOriginHeaders });
  expect(login.ok()).toBeTruthy();
  const launch = await skillAura.post('/api/auth/exam-launch', { data: {}, headers: sameOriginHeaders });
  expect(launch.ok()).toBeTruthy();
  const payload = await launch.json();
  expect(payload.launchUrl).toMatch(/^http:\/\/localhost:3000\/sso\/launch\?code=[A-Za-z0-9_-]+$/);
  return { skillAura, launchUrl: payload.launchUrl as string };
}

async function enterExamPortal(role: keyof typeof users) {
  const { skillAura, launchUrl } = await createLaunch(role);
  const examPortal = await apiRequest.newContext({ baseURL: examPortalBaseURL });
  const launch = await examPortal.get(launchUrl, { maxRedirects: 0 });
  expect(launch.status()).toBe(302);
  expect(launch.headers().location).toBe('/student-portal.html');
  return { skillAura, examPortal, launchUrl };
}

test.describe('SkillAura to Exam Portal SSO', () => {
  test('authenticated Student can start SSO and receives a normal student session', async () => {
    const { examPortal } = await enterExamPortal('student');
    const profile = await examPortal.get('/api/student/profile');
    expect(profile.status()).toBe(200);
    const body = await profile.json();
    expect(body.profile.email).toBeTruthy();
  });

  test('Employee/Working Professional maps to the learner session', async () => {
    const { examPortal } = await enterExamPortal('employee');
    expect((await examPortal.get('/api/student/profile')).status()).toBe(200);
    expect((await examPortal.get('/admin.html', { maxRedirects: 0 })).status()).toBe(302);
  });

  test('Tutor maps to the learner session without examiner access', async () => {
    const { examPortal } = await enterExamPortal('tutor');
    expect((await examPortal.get('/api/student/profile')).status()).toBe(200);
    expect((await examPortal.get('/admin.html', { maxRedirects: 0 })).status()).toBe(302);
  });

  test('unauthenticated SkillAura user cannot create an SSO launch', async ({ request }) => {
    const response = await request.post(`${skillAuraBaseURL}/api/auth/exam-launch`, { data: {}, headers: sameOriginHeaders });
    expect(response.status()).toBe(401);
  });

  test('invalid launch code is rejected', async () => {
    const examPortal = await apiRequest.newContext({ baseURL: examPortalBaseURL });
    expect((await examPortal.get('/sso/launch?code=invalid-code', { maxRedirects: 0 })).status()).toBe(401);
  });

  test('expired launch code is rejected', async () => {
    const { skillAura, launchUrl } = await createLaunch('student');
    await new Promise((resolve) => setTimeout(resolve, 150));
    const examPortal = await test.request.newContext({ baseURL: examPortalBaseURL });
    expect((await examPortal.get(launchUrl, { maxRedirects: 0 })).status()).toBe(401);
    await skillAura.dispose();
  });

  test('a launch code is single-use and cannot be exchanged twice', async () => {
    const { launchUrl } = await createLaunch('student');
    const firstPortal = await apiRequest.newContext({ baseURL: examPortalBaseURL });
    expect((await firstPortal.get(launchUrl, { maxRedirects: 0 })).status()).toBe(302);
    const secondPortal = await apiRequest.newContext({ baseURL: examPortalBaseURL });
    expect((await secondPortal.get(launchUrl, { maxRedirects: 0 })).status()).toBe(401);
  });

  test('SSO cannot obtain examiner privileges or return secrets', async () => {
    const { examPortal } = await enterExamPortal('student');
    expect((await examPortal.get('/api/question-banks')).status()).toBe(403);
    const profile = await examPortal.get('/api/student/profile');
    const body = await profile.json();
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('SSO_SHARED_SECRET');
    expect(serialized).not.toContain('password');
  });

  test('local development services are available on ports 4173 and 3000', async ({ request }) => {
    expect((await request.get(`${skillAuraBaseURL}/api/health`)).status()).toBe(200);
    expect((await request.get(`${examPortalBaseURL}/admin-login.html`)).status()).toBe(200);
  });

  test('Exam Portal logout destroys the SSO-created session', async () => {
    const { examPortal } = await enterExamPortal('student');
    expect((await examPortal.post('/api/admin/logout')).status()).toBe(200);
    expect((await examPortal.get('/api/student/profile')).status()).toBe(403);
  });
});
