import { expect, test } from '@playwright/test';

const demoCredentials = {
  email: 'demo@student.skillaura',
  password: 'demo-access',
  role: 'student',
};
const sameOriginHeaders = { Origin: 'http://localhost:4173' };

async function loginAsDemoStudent(page: import('@playwright/test').Page) {
  await page.goto('/#/login');
  await page.waitForSelector('#app');
  await page.getByRole('button', { name: 'Demo Student' }).click();
  await page.waitForURL(/#\/student\/dashboard/);
}

test.describe('SkillAura server authentication session', () => {
  test('successful login creates a server session', async ({ request }) => {
    const loginResponse = await request.post('/api/auth/login', { data: demoCredentials, headers: sameOriginHeaders });

    expect(loginResponse.ok()).toBeTruthy();
    const loginBody = await loginResponse.json();
    expect(loginBody.user).toMatchObject({
      email: demoCredentials.email,
      role: demoCredentials.role,
    });
    expect(loginBody.user.password).toBeUndefined();
    expect(loginBody.user.passwordHash).toBeUndefined();

    const identityResponse = await request.get('/api/auth/me');
    expect(identityResponse.status()).toBe(200);
    expect(await identityResponse.json()).toEqual({ user: loginBody.user });
  });

  test('authenticated session survives page refresh', async ({ page }) => {
    await loginAsDemoStudent(page);

    await page.reload();
    await expect(page).toHaveURL(/#\/student\/dashboard/);

    const identity = await page.evaluate(async () => {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
      return { status: response.status, body: await response.json() };
    });
    expect(identity.status).toBe(200);
    expect(identity.body.user.email).toBe(demoCredentials.email);
  });

  test('logout destroys the server session', async ({ page }) => {
    await loginAsDemoStudent(page);

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/#\/login/);

    const identity = await page.evaluate(async () => {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
      return { status: response.status, body: await response.json() };
    });
    expect(identity.status).toBe(401);
    expect(identity.body.user).toBeUndefined();
  });

  test('unauthenticated /api/auth/me is rejected', async ({ request }) => {
    const response = await request.get('/api/auth/me');

    expect(response.status()).toBe(401);
  });

  test('wrong credentials remain rejected', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { ...demoCredentials, password: 'wrong-password' },
      headers: sameOriginHeaders,
    });

    expect(response.status()).toBe(401);
    expect((await response.json()).user).toBeUndefined();
  });

  test('state-changing auth requests require same-origin headers', async ({ request }) => {
    const response = await request.post('/api/auth/login', { data: demoCredentials });

    expect(response.status()).toBe(403);
  });

  test('repeated failed login attempts are rate limited', async ({ request }) => {
    const credentials = { ...demoCredentials, email: 'rate-limit-test@example.test', password: 'wrong-password' };
    const responses = [];
    for (let attempt = 0; attempt < 9; attempt += 1) {
      responses.push(await request.post('/api/auth/login', { data: credentials, headers: sameOriginHeaders }));
    }

    expect(responses.slice(0, 8).every((response) => response.status() === 401)).toBeTruthy();
    expect(responses[8].status()).toBe(429);
  });

  test('legacy client account records do not retain password hashes', async ({ page }) => {
    await page.goto('/#/login');
    await page.waitForSelector('#app');
    const accountState = await page.evaluate(() => {
      const keys = ['skillaura-student-accounts', 'skillaura-company-accounts', 'skillaura-institution-accounts', 'skillaura-tutor-accounts'];
      return keys.flatMap((key) => {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
      });
    });

    expect(accountState.every((account) => !Object.hasOwn(account, 'passwordHash'))).toBeTruthy();
  });
});
