# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: skillaura.spec.ts >> Company Portal >> Company can view Candidates
- Location: tests/skillaura.spec.ts:470:3

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
      - button "↪ Logout" [ref=e22] [cursor=pointer]
    - main [ref=e23]:
      - generic [ref=e24]:
        - heading "Find Candidates" [level=2] [ref=e26]
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
          - generic [ref=e38]: TS
          - generic [ref=e39]:
            - text: TechNova Solutions
            - generic [ref=e40]: Company
      - generic [ref=e41]:
        - generic [ref=e43]:
          - heading "Candidate Discovery" [level=1] [ref=e44]
          - paragraph [ref=e45]: Search students by verified skills and readiness.
        - textbox "Search skill, college, course, or name" [ref=e46]:
          - /placeholder: ⌕  Search skill, college, course, or name
        - article [ref=e48]:
          - generic [ref=e49]:
            - generic [ref=e50]: DS
            - strong [ref=e51]: Demo Student
            - text: SkillAura Demo University
          - paragraph [ref=e52]:
            - generic [ref=e53]: 100% match
            - text: Python 78% · JavaScript 74% · HTML/CSS 86% · SQL 63% · Git 71%
          - generic [ref=e54]:
            - button "View Profile" [ref=e55] [cursor=pointer]
            - button "Shortlist" [ref=e56] [cursor=pointer]
            - button "Compare" [ref=e57] [cursor=pointer]
  - button "Open SkillAura AI Assistant" [ref=e58]:
    - generic [aria-hidden]: ✦
```