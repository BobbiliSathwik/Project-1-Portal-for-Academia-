# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: skillaura.spec.ts >> Company Portal >> Company can navigate to Post Opportunity
- Location: tests/skillaura.spec.ts:459:3

# Error details

```
Test timeout of 30000ms exceeded.
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
        - heading "Create Opportunity" [level=2] [ref=e27]
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
        - generic [ref=e44]:
          - heading "Create Internship, Job, or Project" [level=1] [ref=e45]
          - paragraph [ref=e46]: Define a clear opportunity and structured skill requirements.
        - generic [ref=e47]:
          - generic [ref=e48]: Opportunity Title *
          - textbox [ref=e49]
          - generic [ref=e50]: Type *
          - combobox [ref=e51]:
            - option "Select type" [selected]
            - option "Internship"
            - option "Full-time Job"
            - option "Apprenticeship"
            - option "Live Project"
            - option "Part-time"
          - generic [ref=e52]: Department
          - textbox [ref=e53]
          - generic [ref=e54]: Location
          - textbox [ref=e55]
          - generic [ref=e56]: Work Mode
          - combobox [ref=e57]:
            - option "On-site" [selected]
            - option "Hybrid"
            - option "Remote"
          - generic [ref=e58]: Description *
          - textbox [ref=e59]
          - generic [ref=e60]: Responsibilities
          - textbox [ref=e61]
          - generic [ref=e62]: Eligibility / Education
          - textbox "B.Tech, BCA, or equivalent" [ref=e63]
          - generic [ref=e64]: Year of Study
          - textbox "2nd, 3rd, or 4th year" [ref=e65]
          - generic [ref=e66]: Required Skills * (comma separated)
          - textbox "HTML, CSS, JavaScript, React, Git" [ref=e67]
          - generic [ref=e68]: Preferred Skills
          - textbox "TypeScript, Figma" [ref=e69]
          - generic [ref=e70]: Minimum Skill Level
          - combobox [ref=e71]:
            - option "Beginner"
            - option "Intermediate" [selected]
            - option "Advanced"
          - generic [ref=e72]: Experience
          - textbox "No prior experience required" [ref=e73]
          - generic [ref=e74]: Stipend / Salary
          - textbox [ref=e75]
          - generic [ref=e76]: Duration
          - textbox "3 months" [ref=e77]
          - generic [ref=e78]: Application Deadline
          - textbox [ref=e79]
          - generic [ref=e80]: Number of Openings
          - spinbutton [ref=e81]: "1"
          - generic [ref=e82]:
            - button "Save Draft" [ref=e83] [cursor=pointer]
            - button "Publish Opportunity" [ref=e84] [cursor=pointer]
  - button "Open SkillAura AI Assistant" [ref=e85]:
    - generic [aria-hidden]: ✦
```