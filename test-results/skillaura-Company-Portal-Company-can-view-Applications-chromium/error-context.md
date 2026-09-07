# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: skillaura.spec.ts >> Company Portal >> Company can view Applications
- Location: tests/skillaura.spec.ts:481:3

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
          - /url: "#/company/dashboard"
        - link "◉ Company Profile" [ref=e10] [cursor=pointer]:
          - /url: "#/company/profile"
        - link "◉ Opportunities" [ref=e11] [cursor=pointer]:
          - /url: "#/company/opportunities"
        - link "◉ Candidates" [ref=e12] [cursor=pointer]:
          - /url: "#/company/candidates"
        - link "▥ Analytics" [ref=e13] [cursor=pointer]:
          - /url: "#/company/analytics"
        - link "◉ Applications" [ref=e14] [cursor=pointer]:
          - /url: "#/company/applications"
        - link "◉ Shortlist" [ref=e15] [cursor=pointer]:
          - /url: "#/company/shortlist"
        - link "◉ Interviews" [ref=e16] [cursor=pointer]:
          - /url: "#/company/interviews"
        - link "◉ Messages" [ref=e17] [cursor=pointer]:
          - /url: "#/company/messages"
        - link "◉ Notifications" [ref=e18] [cursor=pointer]:
          - /url: "#/company/notifications"
        - link "◉ Industry Programs" [ref=e19] [cursor=pointer]:
          - /url: "#/company/programs"
        - link "◉ Post Opportunity" [ref=e20] [cursor=pointer]:
          - /url: "#/company/post-opportunity"
        - link "⚙ Settings" [ref=e21] [cursor=pointer]:
          - /url: "#/company/settings"
      - button "↪ Logout" [ref=e23] [cursor=pointer]
    - main [ref=e24]:
      - generic [ref=e25]:
        - heading "Company Dashboard" [level=2] [ref=e27]
        - generic [ref=e28]:
          - generic [ref=e30]:
            - generic [aria-hidden] [ref=e31]: ⌕
            - searchbox "Search anything" [ref=e32]
            - generic [ref=e33]: ⌘ K
          - button "Switch to black mode" [ref=e34] [cursor=pointer]:
            - generic [aria-hidden] [ref=e35]: ◐
            - generic [ref=e36]: White
          - generic [ref=e37]: Demo Account
          - button "Notifications" [ref=e38] [cursor=pointer]: ◌
          - generic [ref=e39]: TS
          - generic [ref=e40]:
            - text: TechNova Solutions
            - generic [ref=e41]: Company
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]:
            - heading "Good morning, TechNova Solutions" [level=1] [ref=e45]
            - paragraph [ref=e46]: Your recruitment command center.
          - button "＋ Post Opportunity" [ref=e47] [cursor=pointer]
        - generic [ref=e48]:
          - button "Active Opportunities ◉ 3 Open workspace →" [ref=e49] [cursor=pointer]:
            - generic [ref=e50]:
              - generic [ref=e51]: Active Opportunities
              - generic [ref=e52]: ◉
            - generic [ref=e53]: "3"
            - generic [ref=e54]: Open workspace →
          - button "Applications Received ◉ 1 Open workspace →" [ref=e55] [cursor=pointer]:
            - generic [ref=e56]:
              - generic [ref=e57]: Applications Received
              - generic [ref=e58]: ◉
            - generic [ref=e59]: "1"
            - generic [ref=e60]: Open workspace →
          - button "Candidates Shortlisted ◉ 0 Open workspace →" [ref=e61] [cursor=pointer]:
            - generic [ref=e62]:
              - generic [ref=e63]: Candidates Shortlisted
              - generic [ref=e64]: ◉
            - generic [ref=e65]: "0"
            - generic [ref=e66]: Open workspace →
          - button "Interviews Scheduled ◉ 0 Open workspace →" [ref=e67] [cursor=pointer]:
            - generic [ref=e68]:
              - generic [ref=e69]: Interviews Scheduled
              - generic [ref=e70]: ◉
            - generic [ref=e71]: "0"
            - generic [ref=e72]: Open workspace →
          - button "Offers Made ◉ 0 Open workspace →" [ref=e73] [cursor=pointer]:
            - generic [ref=e74]:
              - generic [ref=e75]: Offers Made
              - generic [ref=e76]: ◉
            - generic [ref=e77]: "0"
            - generic [ref=e78]: Open workspace →
          - button "Hires / Selections ◉ 0 Open workspace →" [ref=e79] [cursor=pointer]:
            - generic [ref=e80]:
              - generic [ref=e81]: Hires / Selections
              - generic [ref=e82]: ◉
            - generic [ref=e83]: "0"
            - generic [ref=e84]: Open workspace →
        - generic [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e87]:
              - heading "Recent Applications" [level=3] [ref=e88]
              - button "View all →" [ref=e89] [cursor=pointer]
            - generic [ref=e90]:
              - generic [ref=e91]:
                - text: Demo Student
                - paragraph [ref=e92]: Frontend Developer Intern · 2026-08-20
              - generic [ref=e93]:
                - generic [ref=e94]: Applied
                - text: 90% match
          - generic [ref=e95]:
            - generic [ref=e96]:
              - heading "Recruitment Activity" [level=3] [ref=e97]
              - button "View analytics →" [ref=e98] [cursor=pointer]
            - generic [ref=e99]: Recruitment activity will appear here.
  - button "Open SkillAura AI Assistant" [ref=e100]:
    - generic [aria-hidden]: ✦
```

# Test source

```ts
  332 |       
  333 |       // Select an option
  334 |       await skillSelect.selectOption({ index: 1 });
  335 |       await page.waitForTimeout(300);
  336 |       
  337 |       const selectedValue = await skillSelect.inputValue();
  338 |       expect(selectedValue).toBeTruthy();
  339 |     }
  340 |   });
  341 | 
  342 |   test('Assessment questions are displayed', async ({ page }) => {
  343 |     await page.goto(ROUTES.studentMockInterview);
  344 |     await waitForAppLoad(page);
  345 |     
  346 |     // Look for question content
  347 |     const questionText = page.locator('text=/[?].*$/');
  348 |     const questionsExist = await questionText.count();
  349 |     expect(questionsExist).toBeGreaterThanOrEqual(0); // May or may not have questions depending on UI
  350 |   });
  351 | 
  352 |   test('Navigation buttons work (Previous/Next)', async ({ page }) => {
  353 |     await page.goto(ROUTES.studentMockInterview);
  354 |     await waitForAppLoad(page);
  355 |     
  356 |     // Look for next button
  357 |     const nextButton = page.locator('button:has-text("Next"), button:has-text("→")');
  358 |     const prevButton = page.locator('button:has-text("Previous"), button:has-text("←")');
  359 |     
  360 |     if (await nextButton.isVisible()) {
  361 |       await nextButton.click();
  362 |       await page.waitForTimeout(300);
  363 |       
  364 |       // Page should still be on assessment
  365 |       const url = page.url();
  366 |       expect(url).toContain('mock-interview') || expect(url).toContain('assessment');
  367 |     }
  368 |   });
  369 | 
  370 |   test('Assessment can be submitted', async ({ page }) => {
  371 |     await page.goto(ROUTES.studentMockInterview);
  372 |     await waitForAppLoad(page);
  373 |     
  374 |     const submitButton = page.locator('button:has-text("Submit"), button:has-text("Submit Assessment"), button:has-text("Finish")');
  375 |     if (await submitButton.isVisible()) {
  376 |       await submitButton.click();
  377 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  378 |       
  379 |       // Should navigate away from assessment
  380 |       const url = page.url();
  381 |       expect(url).not.toContain('mock-interview') || true; // May stay on same page with results
  382 |     }
  383 |   });
  384 | });
  385 | 
  386 | test.describe('Student Applications & Opportunities', () => {
  387 |   test.beforeEach(async ({ page }) => {
  388 |     // Login as student
  389 |     await page.goto(ROUTES.login);
  390 |     await waitForAppLoad(page);
  391 |     
  392 |     const demoButton = page.locator('button:has-text("Demo Student")');
  393 |     await demoButton.click();
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
> 432 |   test.beforeEach(async ({ page }) => {
      |        ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
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
  494 |   test.beforeEach(async ({ page }) => {
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
```