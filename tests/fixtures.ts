import { test as base, type Page } from '@playwright/test';

/**
 * Custom test fixture for SkillAura tests
 */
export const test = base.extend({});

export { expect } from '@playwright/test';

/**
 * Test utilities and helpers
 */

export const TEST_USERS = {
  student: {
    email: 'testrahul@example.com',
    name: 'Rahul Kumar',
    password: 'TestPass123!',
    role: 'student',
  },
  company: {
    email: 'testcompany@example.com',
    name: 'Test Company',
    password: 'TestPass123!',
    role: 'industry', // The app uses 'industry' for company role
  },
  institution: {
    email: 'testinstitution@example.com',
    name: 'Test Institution',
    password: 'TestPass123!',
    role: 'institution',
  },
};

export const ROUTES = {
  home: '/#/',
  login: '/#/login',
  register: '/#/register',
  roleSelection: '/#/role-selection',
  studentDashboard: '/#/student/dashboard',
  studentProfile: '/#/student/profile',
  studentSkills: '/#/student/skills',
  studentOpportunities: '/#/student/opportunities',
  studentApplications: '/#/student/applications',
  studentSettings: '/#/student/settings',
  companyDashboard: '/#/company/dashboard',
  companyProfile: '/#/company/profile',
  companyOpportunities: '/#/company/opportunities',
  companyPostOpportunity: '/#/company/post-opportunity',
  companyCandidates: '/#/company/candidates',
  institutionDashboard: '/#/institution/dashboard',
  institutionProfile: '/#/institution/profile',
  studentMockInterview: '/#/student/mock-interview',
};

export const SELECTORS = {
  // Global
  app: '#app',
  globalBackground: '#global-background',
  themeToggle: '[data-theme-toggle]',
  
  // Auth
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  nameInput: 'input[placeholder*="name"]',
  loginButton: 'button:has-text("Login")',
  registerButton: 'button:has-text("Create Account")',
  backToHomeLink: 'a[href="#/"]',
  
  // Role Selection
  roleOption: '[data-action="choose-role"]',
  studentRoleButton: '[data-role="student"]',
  companyRoleButton: '[data-role="company"]',
  institutionRoleButton: '[data-role="institution"]',
  
  // Dashboard
  sidebar: '.sidebar',
  sidebarLink: '.side-nav a',
  logoutButton: 'button[data-action="logout"]',
  dashboardTitle: 'h1', // General selector, will need context
  
  // Skill Assessment
  assessmentButton: 'button:has-text("Start Assessment")',
  skillSelect: 'select',
  questionText: '.question',
  answerButton: 'button:has-text("Answer")',
  nextButton: 'button:has-text("Next")',
  prevButton: 'button:has-text("Previous")',
  submitButton: 'button:has-text("Submit")',
  
  // Theme
  blackModeLabel: 'span:has-text("Black")',
  whiteModeLabel: 'span:has-text("White")',
  
  // Navigation
  homeButton: 'a:has-text("Home")',
  backButton: 'a[href*="←"]',
  
  // Form
  form: '.form',
  formInput: 'input, select, textarea',
};

/**
 * Navigation helpers
 */
export async function goHome(page: Page) {
  await page.goto(ROUTES.home);
  await page.waitForLoadState('networkidle');
}

export async function goToLogin(page: Page) {
  await page.goto(ROUTES.login);
  await page.waitForLoadState('networkidle');
}

export async function goToRegister(page: Page) {
  await page.goto(ROUTES.register);
  await page.waitForLoadState('networkidle');
}

/**
 * Theme helpers
 */
export async function setTheme(page: Page, theme: string) {
  await page.evaluate((t) => {
    localStorage.setItem('skillaura-theme', t);
    document.documentElement.dataset.theme = t;
  }, theme);
  await page.reload();
}

export async function getTheme(page: Page) {
  return await page.evaluate(() => {
    return document.documentElement.dataset.theme || 'light';
  });
}

/**
 * Auth helpers
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto(ROUTES.login);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Login")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
}

export async function register(page: Page, name: string, email: string, password: string, role: string = 'Student') {
  await page.goto(ROUTES.register);
  await page.fill('input[placeholder*="full name" i]', name);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]:nth-of-type(1)', password);
  await page.fill('input[type="password"]:nth-of-type(2)', password);
  await page.selectOption('select', role);
  await page.click('button:has-text("Create Account")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page) {
  const session = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('skillaura-current-user') || '{}');
    } catch {
      return null;
    }
  });
  return session && session.loggedIn === true;
}

/**
 * Logout
 */
export async function logout(page: Page) {
  try {
    await page.click('button[data-action="logout"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  } catch {
    // Logout might not always work in headless mode
  }
}

/**
 * Wait for app to load
 */
export async function waitForAppLoad(page: Page) {
  await page.waitForSelector('#app', { timeout: 5000 });
  await page.waitForLoadState('networkidle');
}
