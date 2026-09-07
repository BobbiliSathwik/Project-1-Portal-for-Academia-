# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: skillaura.spec.ts >> Institution Portal >> Institution dashboard opens correctly
- Location: tests/skillaura.spec.ts:504:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "↗ SkillAura" [ref=e6] [cursor=pointer]:
        - /url: "#/"
        - generic [ref=e7]: ↗
        - text: SkillAura
      - navigation [ref=e8]:
        - link "⌂ Dashboard" [ref=e9] [cursor=pointer]:
          - /url: "#/institution/dashboard"
        - link "◉ Students" [ref=e10] [cursor=pointer]:
          - /url: "#/institution/students"
        - link "◉ Assessments" [ref=e11] [cursor=pointer]:
          - /url: "#/institution/assessments"
        - link "◉ Institution Profile" [ref=e12] [cursor=pointer]:
          - /url: "#/institution/profile"
        - link "✦ Student Skills" [ref=e13] [cursor=pointer]:
          - /url: "#/institution/skills"
        - link "◉ Skill Gaps" [ref=e14] [cursor=pointer]:
          - /url: "#/institution/skill-gaps"
        - link "◉ Learning & Development" [ref=e15] [cursor=pointer]:
          - /url: "#/institution/learning"
        - link "◉ Internships" [ref=e16] [cursor=pointer]:
          - /url: "#/institution/internships"
        - link "◉ Placements" [ref=e17] [cursor=pointer]:
          - /url: "#/institution/placements"
        - link "◉ Industry Opportunities" [ref=e18] [cursor=pointer]:
          - /url: "#/institution/industry"
        - link "◉ Faculty Opportunities" [ref=e19] [cursor=pointer]:
          - /url: "#/institution/faculty"
        - link "▥ Analytics" [ref=e20] [cursor=pointer]:
          - /url: "#/institution/analytics"
        - link "◉ Partnerships" [ref=e21] [cursor=pointer]:
          - /url: "#/institution/partnerships"
        - link "◉ Reports & Analytics" [ref=e22] [cursor=pointer]:
          - /url: "#/institution/reports"
        - link "◉ Notifications" [ref=e23] [cursor=pointer]:
          - /url: "#/institution/notifications"
        - link "⚙ Settings" [ref=e24] [cursor=pointer]:
          - /url: "#/institution/settings"
      - button "↪ Logout" [ref=e25] [cursor=pointer]
    - main [ref=e26]:
      - generic [ref=e27]:
        - heading "Institution Dashboard" [level=2] [ref=e29]
        - generic [ref=e30]:
          - generic [ref=e32]:
            - generic [aria-hidden] [ref=e33]: ⌕
            - searchbox "Search anything" [ref=e34]
            - generic [ref=e35]: ⌘ K
          - button "Switch to black mode" [ref=e36] [cursor=pointer]:
            - generic [aria-hidden] [ref=e37]: ◐
            - generic [ref=e38]: White
          - generic [ref=e39]: Demo Account
          - button "Notifications" [ref=e40] [cursor=pointer]: ◌
          - generic [ref=e41]: SD
          - generic [ref=e42]:
            - text: SkillAura Demo Institute
            - generic [ref=e43]: Institution
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]:
            - heading "Good morning, SkillAura Demo Institute" [level=1] [ref=e47]
            - paragraph [ref=e48]: Turn student skills into measurable industry readiness.
          - button "＋ Manage Students" [ref=e49] [cursor=pointer]
        - generic [ref=e50]:
          - button "Total Students ◉ 1 Open section →" [ref=e51] [cursor=pointer]:
            - generic [ref=e52]:
              - generic [ref=e53]: Total Students
              - generic [ref=e54]: ◉
            - generic [ref=e55]: "1"
            - generic [ref=e56]: Open section →
          - button "Students Assessed ◉ 1 Open section →" [ref=e57] [cursor=pointer]:
            - generic [ref=e58]:
              - generic [ref=e59]: Students Assessed
              - generic [ref=e60]: ◉
            - generic [ref=e61]: "1"
            - generic [ref=e62]: Open section →
          - button "Verified Skills ◉ 1 Open section →" [ref=e63] [cursor=pointer]:
            - generic [ref=e64]:
              - generic [ref=e65]: Verified Skills
              - generic [ref=e66]: ◉
            - generic [ref=e67]: "1"
            - generic [ref=e68]: Open section →
          - button "Active Applications ◉ 1 Open section →" [ref=e69] [cursor=pointer]:
            - generic [ref=e70]:
              - generic [ref=e71]: Active Applications
              - generic [ref=e72]: ◉
            - generic [ref=e73]: "1"
            - generic [ref=e74]: Open section →
          - button "Students Shortlisted ◉ 0 Open section →" [ref=e75] [cursor=pointer]:
            - generic [ref=e76]:
              - generic [ref=e77]: Students Shortlisted
              - generic [ref=e78]: ◉
            - generic [ref=e79]: "0"
            - generic [ref=e80]: Open section →
          - button "Active Internships ◉ 0 Open section →" [ref=e81] [cursor=pointer]:
            - generic [ref=e82]:
              - generic [ref=e83]: Active Internships
              - generic [ref=e84]: ◉
            - generic [ref=e85]: "0"
            - generic [ref=e86]: Open section →
          - button "Students Placed ◉ 0 Open section →" [ref=e87] [cursor=pointer]:
            - generic [ref=e88]:
              - generic [ref=e89]: Students Placed
              - generic [ref=e90]: ◉
            - generic [ref=e91]: "0"
            - generic [ref=e92]: Open section →
          - button "Collaborations ◉ 0 Open section →" [ref=e93] [cursor=pointer]:
            - generic [ref=e94]:
              - generic [ref=e95]: Collaborations
              - generic [ref=e96]: ◉
            - generic [ref=e97]: "0"
            - generic [ref=e98]: Open section →
        - generic [ref=e99]:
          - generic [ref=e100]:
            - generic [ref=e101]:
              - heading "Skill Demand Summary" [level=3] [ref=e102]
              - button "View gaps →" [ref=e103] [cursor=pointer]
            - generic [ref=e104]: Skill analytics will appear after students are added.
          - generic [ref=e105]:
            - generic [ref=e106]:
              - heading "Pending Actions" [level=3] [ref=e107]
              - button "View all →" [ref=e108] [cursor=pointer]
            - generic [ref=e109]: No pending actions.
  - button "Open SkillAura AI Assistant" [ref=e110]:
    - generic [aria-hidden]: ✦
```

# Test source

```ts
  394 |     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  395 |   });
  396 | 
  397 |   test('Student can navigate to Opportunities', async ({ page }) => {
  398 |     const oppsLink = page.locator('a:has-text("Opportunities")');
  399 |     if (await oppsLink.isVisible()) {
  400 |       await oppsLink.click();
  401 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  402 |       
  403 |       const url = page.url();
  404 |       expect(url).toContain('opportunities');
  405 |     }
  406 |   });
  407 | 
  408 |   test('Student can navigate to Applications', async ({ page }) => {
  409 |     const appsLink = page.locator('a:has-text("Applications")');
  410 |     if (await appsLink.isVisible()) {
  411 |       await appsLink.click();
  412 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  413 |       
  414 |       const url = page.url();
  415 |       expect(url).toContain('applications');
  416 |     }
  417 |   });
  418 | 
  419 |   test('Student Profile can be updated', async ({ page }) => {
  420 |     const profileLink = page.locator('a:has-text("My Profile"), a:has-text("Profile")');
  421 |     if (await profileLink.isVisible()) {
  422 |       await profileLink.click();
  423 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  424 |       
  425 |       const url = page.url();
  426 |       expect(url).toContain('profile');
  427 |     }
  428 |   });
  429 | });
  430 | 
  431 | test.describe('Company Portal', () => {
  432 |   test.beforeEach(async ({ page }) => {
  433 |     // Login as company/industry
  434 |     await page.goto(ROUTES.login);
  435 |     await waitForAppLoad(page);
  436 |     
  437 |     const demoButton = page.locator('button:has-text("Demo Industry")');
  438 |     await demoButton.click();
  439 |     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  440 |   });
  441 | 
  442 |   test('Company dashboard opens correctly', async ({ page }) => {
  443 |     const url = page.url();
  444 |     expect(url).toContain('dashboard');
  445 |     expect(url).toContain('company') || expect(url).toContain('industry');
  446 |   });
  447 | 
  448 |   test('Company can navigate to Opportunities', async ({ page }) => {
  449 |     const oppsLink = page.locator('a:has-text("Opportunities")');
  450 |     if (await oppsLink.isVisible()) {
  451 |       await oppsLink.click();
  452 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  453 |       
  454 |       const url = page.url();
  455 |       expect(url).toContain('opportunities');
  456 |     }
  457 |   });
  458 | 
  459 |   test('Company can navigate to Post Opportunity', async ({ page }) => {
  460 |     const postLink = page.locator('a:has-text("Post Opportunity")');
  461 |     if (await postLink.isVisible()) {
  462 |       await postLink.click();
  463 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  464 |       
  465 |       const url = page.url();
  466 |       expect(url).toContain('post-opportunity') || expect(url).toContain('opportunity');
  467 |     }
  468 |   });
  469 | 
  470 |   test('Company can view Candidates', async ({ page }) => {
  471 |     const candidatesLink = page.locator('a:has-text("Candidates")');
  472 |     if (await candidatesLink.isVisible()) {
  473 |       await candidatesLink.click();
  474 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  475 |       
  476 |       const url = page.url();
  477 |       expect(url).toContain('candidates');
  478 |     }
  479 |   });
  480 | 
  481 |   test('Company can view Applications', async ({ page }) => {
  482 |     const appsLink = page.locator('a:has-text("Applications")');
  483 |     if (await appsLink.isVisible()) {
  484 |       await appsLink.click();
  485 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  486 |       
  487 |       const url = page.url();
  488 |       expect(url).toContain('applications');
  489 |     }
  490 |   });
  491 | });
  492 | 
  493 | test.describe('Institution Portal', () => {
> 494 |   test.beforeEach(async ({ page }) => {
      |        ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  495 |     // Login as institution
  496 |     await page.goto(ROUTES.login);
  497 |     await waitForAppLoad(page);
  498 |     
  499 |     const demoButton = page.locator('button:has-text("Demo Institution")');
  500 |     await demoButton.click();
  501 |     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  502 |   });
  503 | 
  504 |   test('Institution dashboard opens correctly', async ({ page }) => {
  505 |     const url = page.url();
  506 |     expect(url).toContain('institution');
  507 |     expect(url).toContain('dashboard');
  508 |   });
  509 | 
  510 |   test('Institution can view Students', async ({ page }) => {
  511 |     const studentsLink = page.locator('a:has-text("Students")');
  512 |     if (await studentsLink.isVisible()) {
  513 |       await studentsLink.click();
  514 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  515 |       
  516 |       const url = page.url();
  517 |       expect(url).toContain('students');
  518 |     }
  519 |   });
  520 | 
  521 |   test('Institution can view Assessments', async ({ page }) => {
  522 |     const assessmentsLink = page.locator('a:has-text("Assessments")');
  523 |     if (await assessmentsLink.isVisible()) {
  524 |       await assessmentsLink.click();
  525 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  526 |       
  527 |       const url = page.url();
  528 |       expect(url).toContain('assessments');
  529 |     }
  530 |   });
  531 | 
  532 |   test('Institution can view Skill Gaps', async ({ page }) => {
  533 |     const skillGapsLink = page.locator('a:has-text("Skill Gaps")');
  534 |     if (await skillGapsLink.isVisible()) {
  535 |       await skillGapsLink.click();
  536 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  537 |       
  538 |       const url = page.url();
  539 |       expect(url).toContain('skill-gaps');
  540 |     }
  541 |   });
  542 | });
  543 | 
  544 | test.describe('Navigation & UI', () => {
  545 |   test('Back button navigates correctly', async ({ page }) => {
  546 |     await page.goto(ROUTES.studentDashboard);
  547 |     await waitForAppLoad(page);
  548 |     
  549 |     const backButton = page.locator('a:has-text("← ")').first();
  550 |     if (await backButton.isVisible()) {
  551 |       const initialUrl = page.url();
  552 |       await backButton.click();
  553 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  554 |       
  555 |       const newUrl = page.url();
  556 |       expect(newUrl).not.toEqual(initialUrl) || true; // May not navigate if already at home
  557 |     }
  558 |   });
  559 | 
  560 |   test('Home button returns to home', async ({ page }) => {
  561 |     await page.goto(ROUTES.studentDashboard);
  562 |     await waitForAppLoad(page);
  563 |     
  564 |     const homeButton = page.locator('a:has-text("⌂")').first();
  565 |     if (await homeButton.isVisible()) {
  566 |       await homeButton.click();
  567 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  568 |       
  569 |       const url = page.url();
  570 |       expect(url).not.toContain('dashboard') || true;
  571 |     }
  572 |   });
  573 | });
  574 | 
  575 | test.describe('Horizontal Overflow & Responsive', () => {
  576 |   test('No horizontal overflow on desktop', async ({ page }) => {
  577 |     await page.goto(ROUTES.home);
  578 |     await waitForAppLoad(page);
  579 |     
  580 |     const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  581 |     const windowWidth = await page.evaluate(() => window.innerWidth);
  582 |     
  583 |     expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1); // Allow 1px tolerance
  584 |   });
  585 | 
  586 |   test('No horizontal overflow on student dashboard', async ({ page }) => {
  587 |     await page.goto(ROUTES.login);
  588 |     await waitForAppLoad(page);
  589 |     
  590 |     const demoButton = page.locator('button:has-text("Demo Student")');
  591 |     await demoButton.click();
  592 |     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  593 |     
  594 |     const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
```