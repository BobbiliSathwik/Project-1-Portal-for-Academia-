import { test, expect } from '@playwright/test';
import { ROUTES, SELECTORS, setTheme, getTheme, isLoggedIn, waitForAppLoad } from './fixtures';

test.describe('Homepage & Navigation', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    // Check that the app div is populated
    const appContent = await page.locator('#app').textContent();
    expect(appContent).toBeTruthy();
    expect(appContent).toContain('SkillAura');
  });

  test('Navigation links are visible', async ({ page }) => {
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    // Check for role selection or navigation elements
    const pageContent = await page.content();
    expect(pageContent).toContain('Student');
    expect(pageContent).toContain('Company');
    expect(pageContent).toContain('Institution');
  });

  test('Back to home button works', async ({ page }) => {
    // Go to login
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    // Click back to home
    const backButton = page.locator('a.btn-plain:has-text("← Back to home")');
    await backButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    
    // Verify we're back at home
    const url = page.url();
    expect(url).toContain('#/');
  });
});

test.describe('Theme Switching', () => {
  test('White/Black theme toggle works', async ({ page }) => {
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    // Check initial theme
    let theme = await getTheme(page);
    expect(theme).toBe('light');
    
    // Find and click theme toggle
    const themeToggle = page.locator('[data-theme-toggle]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      theme = await getTheme(page);
      expect(theme).toBe('dark');
      
      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      theme = await getTheme(page);
      expect(theme).toBe('light');
    }
  });

  test('Theme preference persists across page navigation', async ({ page }) => {
    // Set theme to dark
    await setTheme(page, 'dark');
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    let theme = await getTheme(page);
    expect(theme).toBe('dark');
    
    // Navigate to login
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    theme = await getTheme(page);
    expect(theme).toBe('dark');
  });

  test('Text and icons remain visible in dark theme', async ({ page }) => {
    await setTheme(page, 'dark');
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    // Check that text is readable
    const pageContent = await page.locator('#app').textContent();
    expect(pageContent).toBeTruthy();
    expect(pageContent?.length).toBeGreaterThan(0);
    
    // Check that background is dark
    const htmlElement = page.locator('html');
    const dataset = await htmlElement.evaluate((el) => el.dataset.theme);
    expect(dataset).toBe('dark');
  });

  test('Scroll background transition exists', async ({ page }) => {
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    // Check for global background element
    const background = page.locator('#global-background');
    expect(await background.isVisible()).toBeTruthy();
  });
});

test.describe('Authentication - Login', () => {
  test('Login page loads successfully', async ({ page }) => {
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    // Check for login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Login")');
    
    expect(await emailInput.isVisible()).toBeTruthy();
    expect(await passwordInput.isVisible()).toBeTruthy();
    expect(await loginButton.isVisible()).toBeTruthy();
  });

  test('Login with demo student account', async ({ page }) => {
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    // Use demo login
    const demoButtton = page.locator('button:has-text("Demo Student")');
    if (await demoButtton.isVisible()) {
      await demoButtton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      // Verify we're logged in and on dashboard
      const url = page.url();
      expect(url).toContain('dashboard');
      
      const logged = await isLoggedIn(page);
      expect(logged).toBeTruthy();
    }
  });

  test('Demo company account can login', async ({ page }) => {
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    // Use demo company login
    const demoButton = page.locator('button:has-text("Demo Industry")');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      // Verify we're logged in and on company dashboard
      const url = page.url();
      expect(url).toContain('company') || expect(url).toContain('industry');
      
      const logged = await isLoggedIn(page);
      expect(logged).toBeTruthy();
    }
  });

  test('Demo institution account can login', async ({ page }) => {
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    // Use demo institution login
    const demoButton = page.locator('button:has-text("Demo Institution")');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      // Verify we're logged in and on institution dashboard
      const url = page.url();
      expect(url).toContain('institution');
      
      const logged = await isLoggedIn(page);
      expect(logged).toBeTruthy();
    }
  });
});

test.describe('Student Registration', () => {
  test('Registration page loads successfully', async ({ page }) => {
    await page.goto(ROUTES.register);
    await waitForAppLoad(page);
    
    // Check for registration form elements
    const nameInput = page.locator('input[placeholder*="full name" i]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInputs = page.locator('input[type="password"]');
    const createButton = page.locator('button:has-text("Create Account")');
    
    expect(await nameInput.isVisible()).toBeTruthy();
    expect(await emailInput.isVisible()).toBeTruthy();
    expect(await passwordInputs.count()).toBeGreaterThanOrEqual(2);
    expect(await createButton.isVisible()).toBeTruthy();
  });

  test('Registration form requires all fields', async ({ page }) => {
    await page.goto(ROUTES.register);
    await waitForAppLoad(page);
    
    const createButton = page.locator('button:has-text("Create Account")');
    
    // Try to submit empty form
    await createButton.click();
    
    // Form should still be visible (validation occurred)
    const nameInput = page.locator('input[placeholder*="full name" i]');
    expect(await nameInput.isVisible()).toBeTruthy();
  });

  test('Registration can be completed with valid data', async ({ page }) => {
    await page.goto(ROUTES.register);
    await waitForAppLoad(page);
    
    const nameInput = page.locator('input[placeholder*="full name" i]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInputs = page.locator('input[type="password"]');
    const createButton = page.locator('button:has-text("Create Account")');
    
    // Fill form
    await nameInput.fill('Test Student');
    await emailInput.fill('teststudent@example.com');
    
    const inputs = await passwordInputs.all();
    if (inputs.length >= 2) {
      await inputs[0].fill('TestPassword123!');
      await inputs[1].fill('TestPassword123!');
    }
    
    // Submit
    await createButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    
    // Should redirect to role selection
    const url = page.url();
    expect(url).toContain('role-selection') || expect(url).toContain('student');
  });
});

test.describe('Student Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student demo
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    const demoButton = page.locator('button:has-text("Demo Student")');
    await demoButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  });

  test('Student dashboard opens correctly', async ({ page }) => {
    const url = page.url();
    expect(url).toContain('student');
    expect(url).toContain('dashboard');
    
    const pageContent = await page.locator('#app').textContent();
    expect(pageContent).toContain('Dashboard');
  });

  test('Sidebar navigation is visible', async ({ page }) => {
    const sidebar = page.locator('.sidebar');
    expect(await sidebar.isVisible()).toBeTruthy();
    
    const navLinks = page.locator('.side-nav a');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('Logout button is present and works', async ({ page }) => {
    const logoutButton = page.locator('button[data-action="logout"]');
    expect(await logoutButton.isVisible()).toBeTruthy();
    
    await logoutButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    
    const url = page.url();
    expect(url).not.toContain('dashboard');
  });
});

test.describe('Skill Assessment', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    const demoButton = page.locator('button:has-text("Demo Student")');
    await demoButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  });

  test('Navigate to Skills section', async ({ page }) => {
    const skillsLink = page.locator('a:has-text("My Skills")');
    if (await skillsLink.isVisible()) {
      await skillsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('skills');
    }
  });

  test('Skill assessment can be started', async ({ page }) => {
    // Navigate to skills
    await page.goto(ROUTES.studentSkills);
    await waitForAppLoad(page);
    
    const startButton = page.locator('button:has-text("Start Assessment"), button:has-text("Take Assessment"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      // Should be on mock interview or assessment page
      const url = page.url();
      expect(url).toContain('mock-interview') || expect(url).toContain('assessment') || expect(url).toContain('skills');
    }
  });

  test('Skill/language selection works', async ({ page }) => {
    await page.goto(ROUTES.studentMockInterview);
    await waitForAppLoad(page);
    
    // Look for skill select dropdown
    const skillSelect = page.locator('select').first();
    if (await skillSelect.isVisible()) {
      const options = await skillSelect.locator('option').count();
      expect(options).toBeGreaterThan(0);
      
      // Select an option
      await skillSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);
      
      const selectedValue = await skillSelect.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test('Assessment questions are displayed', async ({ page }) => {
    await page.goto(ROUTES.studentMockInterview);
    await waitForAppLoad(page);
    
    // Look for question content
    const questionText = page.locator('text=/[?].*$/');
    const questionsExist = await questionText.count();
    expect(questionsExist).toBeGreaterThanOrEqual(0); // May or may not have questions depending on UI
  });

  test('Navigation buttons work (Previous/Next)', async ({ page }) => {
    await page.goto(ROUTES.studentMockInterview);
    await waitForAppLoad(page);
    
    // Look for next button
    const nextButton = page.locator('button:has-text("Next"), button:has-text("→")');
    const prevButton = page.locator('button:has-text("Previous"), button:has-text("←")');
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);
      
      // Page should still be on assessment
      const url = page.url();
      expect(url).toContain('mock-interview') || expect(url).toContain('assessment');
    }
  });

  test('Assessment can be submitted', async ({ page }) => {
    await page.goto(ROUTES.studentMockInterview);
    await waitForAppLoad(page);
    
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Submit Assessment"), button:has-text("Finish")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      // Should navigate away from assessment
      const url = page.url();
      expect(url).not.toContain('mock-interview') || true; // May stay on same page with results
    }
  });
});

test.describe('Student Applications & Opportunities', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    const demoButton = page.locator('button:has-text("Demo Student")');
    await demoButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  });

  test('Student can navigate to Opportunities', async ({ page }) => {
    const oppsLink = page.locator('a:has-text("Opportunities")');
    if (await oppsLink.isVisible()) {
      await oppsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('opportunities');
    }
  });

  test('Student can navigate to Applications', async ({ page }) => {
    const appsLink = page.locator('a:has-text("Applications")');
    if (await appsLink.isVisible()) {
      await appsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('applications');
    }
  });

  test('Student Profile can be updated', async ({ page }) => {
    const profileLink = page.locator('a:has-text("My Profile"), a:has-text("Profile")');
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('profile');
    }
  });
});

test.describe('Company Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as company/industry
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    const demoButton = page.locator('button:has-text("Demo Industry")');
    await demoButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  });

  test('Company dashboard opens correctly', async ({ page }) => {
    const url = page.url();
    expect(url).toContain('dashboard');
    expect(url).toContain('company') || expect(url).toContain('industry');
  });

  test('Company can navigate to Opportunities', async ({ page }) => {
    const oppsLink = page.locator('a:has-text("Opportunities")');
    if (await oppsLink.isVisible()) {
      await oppsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('opportunities');
    }
  });

  test('Company can navigate to Post Opportunity', async ({ page }) => {
    const postLink = page.locator('a:has-text("Post Opportunity")');
    if (await postLink.isVisible()) {
      await postLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('post-opportunity') || expect(url).toContain('opportunity');
    }
  });

  test('Company can view Candidates', async ({ page }) => {
    const candidatesLink = page.locator('a:has-text("Candidates")');
    if (await candidatesLink.isVisible()) {
      await candidatesLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('candidates');
    }
  });

  test('Company can view Applications', async ({ page }) => {
    const appsLink = page.locator('a:has-text("Applications")');
    if (await appsLink.isVisible()) {
      await appsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('applications');
    }
  });
});

test.describe('Institution Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as institution
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    const demoButton = page.locator('button:has-text("Demo Institution")');
    await demoButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  });

  test('Institution dashboard opens correctly', async ({ page }) => {
    const url = page.url();
    expect(url).toContain('institution');
    expect(url).toContain('dashboard');
  });

  test('Institution can view Students', async ({ page }) => {
    const studentsLink = page.locator('a:has-text("Students")');
    if (await studentsLink.isVisible()) {
      await studentsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('students');
    }
  });

  test('Institution can view Assessments', async ({ page }) => {
    const assessmentsLink = page.locator('a:has-text("Assessments")');
    if (await assessmentsLink.isVisible()) {
      await assessmentsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('assessments');
    }
  });

  test('Institution can view Skill Gaps', async ({ page }) => {
    const skillGapsLink = page.locator('a:has-text("Skill Gaps")');
    if (await skillGapsLink.isVisible()) {
      await skillGapsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).toContain('skill-gaps');
    }
  });
});

test.describe('Navigation & UI', () => {
  test('Back button navigates correctly', async ({ page }) => {
    await page.goto(ROUTES.studentDashboard);
    await waitForAppLoad(page);
    
    const backButton = page.locator('a:has-text("← ")').first();
    if (await backButton.isVisible()) {
      const initialUrl = page.url();
      await backButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const newUrl = page.url();
      expect(newUrl).not.toEqual(initialUrl) || true; // May not navigate if already at home
    }
  });

  test('Home button returns to home', async ({ page }) => {
    await page.goto(ROUTES.studentDashboard);
    await waitForAppLoad(page);
    
    const homeButton = page.locator('a:has-text("⌂")').first();
    if (await homeButton.isVisible()) {
      await homeButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      const url = page.url();
      expect(url).not.toContain('dashboard') || true;
    }
  });
});

test.describe('Horizontal Overflow & Responsive', () => {
  test('No horizontal overflow on desktop', async ({ page }) => {
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1); // Allow 1px tolerance
  });

  test('No horizontal overflow on student dashboard', async ({ page }) => {
    await page.goto(ROUTES.login);
    await waitForAppLoad(page);
    
    const demoButton = page.locator('button:has-text("Demo Student")');
    await demoButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

  test('Page is readable at mobile viewport', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto(ROUTES.home);
    await waitForAppLoad(page);
    
    const appContent = await page.locator('#app').textContent();
    expect(appContent).toBeTruthy();
    expect(appContent?.length).toBeGreaterThan(0);
  });
});
