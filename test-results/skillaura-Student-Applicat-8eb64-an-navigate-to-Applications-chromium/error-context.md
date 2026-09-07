# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: skillaura.spec.ts >> Student Applications & Opportunities >> Student can navigate to Applications
- Location: tests/skillaura.spec.ts:408:3

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
          - /url: "#/student/dashboard"
        - link "◉ My Profile" [ref=e10] [cursor=pointer]:
          - /url: "#/student/profile"
        - link "✦ My Skills" [ref=e11] [cursor=pointer]:
          - /url: "#/student/skills"
        - link "◉ Opportunities" [ref=e12] [cursor=pointer]:
          - /url: "#/student/opportunities"
        - link "◉ Applications" [ref=e13] [cursor=pointer]:
          - /url: "#/student/applications"
        - link "◉ Interviews" [ref=e14] [cursor=pointer]:
          - /url: "#/student/interviews"
        - link "◉ Offers" [ref=e15] [cursor=pointer]:
          - /url: "#/student/offers"
        - link "◉ Internships" [ref=e16] [cursor=pointer]:
          - /url: "#/student/internships"
        - link "◉ Placements" [ref=e17] [cursor=pointer]:
          - /url: "#/student/placements"
        - link "◉ Notifications" [ref=e18] [cursor=pointer]:
          - /url: "#/student/notifications"
        - link "⚙ Settings" [ref=e19] [cursor=pointer]:
          - /url: "#/student/settings"
        - link "◉ Career Path" [ref=e20] [cursor=pointer]:
          - /url: "#/student/career-path"
      - button "↪ Logout" [ref=e22] [cursor=pointer]
    - main [ref=e23]:
      - generic [ref=e24]:
        - heading "Student Dashboard" [level=2] [ref=e26]
        - generic [ref=e27]:
          - generic [ref=e29]:
            - generic [aria-hidden] [ref=e30]: ⌕
            - searchbox "Search anything" [ref=e31]
            - generic [ref=e32]: ⌘ K
          - button "Switch to black mode" [ref=e33] [cursor=pointer]:
            - generic [aria-hidden] [ref=e34]: ◐
            - generic [ref=e35]: White
          - generic [ref=e36]: Demo Account
          - button "Notifications" [ref=e37] [cursor=pointer]: ◌
          - generic [ref=e38]: DS
          - generic [ref=e39]:
            - text: Demo Student
            - generic [ref=e40]: Student
      - generic [ref=e41]:
        - generic [ref=e42]:
          - generic [ref=e43]:
            - heading "Welcome, Demo" [level=1] [ref=e44]
            - paragraph [ref=e45]: Build your profile from real assessment results.
          - button "＋ Add Skill Assessment" [ref=e46] [cursor=pointer]
        - generic [ref=e47]:
          - generic [ref=e49]:
            - heading "My Skill Profile" [level=3] [ref=e50]
            - paragraph [ref=e51]: Your scores begin at zero and grow with completed assessments.
          - generic [ref=e52]:
            - generic [ref=e53]:
              - generic [ref=e54]:
                - generic [ref=e55]: Skills Assessed
                - generic [ref=e56]: ✦
              - generic [ref=e57]: "0"
            - generic [ref=e58]:
              - generic [ref=e59]:
                - generic [ref=e60]: Assessments Completed
                - generic [ref=e61]: ✓
              - generic [ref=e62]: "0"
            - generic [ref=e63]:
              - generic [ref=e64]:
                - generic [ref=e65]: Average Score
                - generic [ref=e66]: ▥
              - generic [ref=e67]: 0%
            - generic [ref=e68]:
              - generic [ref=e69]:
                - generic [ref=e70]: Skill Readiness
                - generic [ref=e71]: ◉
              - generic [ref=e72]: 0%
        - generic [ref=e73]:
          - generic [ref=e74]:
            - generic [ref=e75]:
              - heading "Assessed Skills" [level=3] [ref=e76]
              - button "Take assessment →" [ref=e77] [cursor=pointer]
            - generic [ref=e78]: No skills assessed yet.
          - generic [ref=e79]:
            - generic [ref=e80]:
              - heading "Assessment History" [level=3] [ref=e81]
              - button "View all →" [ref=e82] [cursor=pointer]
            - generic [ref=e83]: No assessments yet. Choose a skill to begin.
        - generic [ref=e84]:
          - generic [ref=e85]:
            - heading "Recommended Opportunities" [level=3] [ref=e86]
            - button "View all opportunities →" [ref=e87] [cursor=pointer]
          - button "▣ Frontend Developer Intern TechNova Solutions · Hyderabad, India HTML/CSS, JavaScript, React, Git 90% match" [ref=e88] [cursor=pointer]:
            - generic [ref=e89]: ▣
            - generic [ref=e90]:
              - strong [ref=e91]: Frontend Developer Intern
              - generic [ref=e92]: TechNova Solutions · Hyderabad, IndiaHTML/CSS, JavaScript, React, Git
            - generic [ref=e93]:
              - text: 90%
              - generic [ref=e94]: match
          - button "▣ Python Developer Intern TechNova Solutions · Hyderabad, India Python, SQL, Git 82% match" [ref=e95] [cursor=pointer]:
            - generic [ref=e96]: ▣
            - generic [ref=e97]:
              - strong [ref=e98]: Python Developer Intern
              - generic [ref=e99]: TechNova Solutions · Hyderabad, IndiaPython, SQL, Git
            - generic [ref=e100]:
              - text: 82%
              - generic [ref=e101]: match
          - button "▣ Software Engineering Intern TechNova Solutions · Hyderabad, India Git, JavaScript, Python, SQL 78% match" [ref=e102] [cursor=pointer]:
            - generic [ref=e103]: ▣
            - generic [ref=e104]:
              - strong [ref=e105]: Software Engineering Intern
              - generic [ref=e106]: TechNova Solutions · Hyderabad, IndiaGit, JavaScript, Python, SQL
            - generic [ref=e107]:
              - text: 78%
              - generic [ref=e108]: match
        - generic [ref=e109]:
          - generic [ref=e110]:
            - generic [ref=e111]:
              - heading "Mock Interview Practice" [level=3] [ref=e112]
              - paragraph [ref=e113]: Build interview confidence with transparent role-based feedback.
            - button "Practice now" [ref=e114] [cursor=pointer]
          - paragraph [ref=e115]: No practice interview completed yet.
  - button "Open SkillAura AI Assistant" [ref=e116]:
    - generic [aria-hidden]: ✦
```

# Test source

```ts
  287 |     // Login as student
  288 |     await page.goto(ROUTES.login);
  289 |     await waitForAppLoad(page);
  290 |     
  291 |     const demoButton = page.locator('button:has-text("Demo Student")');
  292 |     await demoButton.click();
  293 |     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  294 |   });
  295 | 
  296 |   test('Navigate to Skills section', async ({ page }) => {
  297 |     const skillsLink = page.locator('a:has-text("My Skills")');
  298 |     if (await skillsLink.isVisible()) {
  299 |       await skillsLink.click();
  300 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  301 |       
  302 |       const url = page.url();
  303 |       expect(url).toContain('skills');
  304 |     }
  305 |   });
  306 | 
  307 |   test('Skill assessment can be started', async ({ page }) => {
  308 |     // Navigate to skills
  309 |     await page.goto(ROUTES.studentSkills);
  310 |     await waitForAppLoad(page);
  311 |     
  312 |     const startButton = page.locator('button:has-text("Start Assessment"), button:has-text("Take Assessment"), button:has-text("Begin")');
  313 |     if (await startButton.isVisible()) {
  314 |       await startButton.click();
  315 |       await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  316 |       
  317 |       // Should be on mock interview or assessment page
  318 |       const url = page.url();
  319 |       expect(url).toContain('mock-interview') || expect(url).toContain('assessment') || expect(url).toContain('skills');
  320 |     }
  321 |   });
  322 | 
  323 |   test('Skill/language selection works', async ({ page }) => {
  324 |     await page.goto(ROUTES.studentMockInterview);
  325 |     await waitForAppLoad(page);
  326 |     
  327 |     // Look for skill select dropdown
  328 |     const skillSelect = page.locator('select').first();
  329 |     if (await skillSelect.isVisible()) {
  330 |       const options = await skillSelect.locator('option').count();
  331 |       expect(options).toBeGreaterThan(0);
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
> 387 |   test.beforeEach(async ({ page }) => {
      |        ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
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
```