# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: skillaura.spec.ts >> Company Portal >> Company can navigate to Opportunities
- Location: tests/skillaura.spec.ts:448:3

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
        - heading "Opportunities" [level=2] [ref=e26]
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
        - generic [ref=e42]:
          - generic [ref=e43]:
            - heading "Manage Opportunities" [level=1] [ref=e44]
            - paragraph [ref=e45]: Create and manage your internships, jobs, and projects.
          - button "＋ Create Opportunity" [ref=e46] [cursor=pointer]
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]:
              - generic [ref=e50]: Internship
              - heading "Frontend Developer Intern" [level=3] [ref=e51]
              - paragraph [ref=e52]: Hyderabad, India · 2 openings · 2026-12-31
              - generic [ref=e53]:
                - generic [ref=e54]: Published
                - text: · 1 applications
            - generic [ref=e55]:
              - button "View Details" [ref=e56] [cursor=pointer]
              - button "Close" [ref=e57] [cursor=pointer]
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]: Internship
              - heading "Python Developer Intern" [level=3] [ref=e61]
              - paragraph [ref=e62]: Hyderabad, India · 2 openings · 2026-12-31
              - generic [ref=e63]:
                - generic [ref=e64]: Published
                - text: · 0 applications
            - generic [ref=e65]:
              - button "View Details" [ref=e66] [cursor=pointer]
              - button "Close" [ref=e67] [cursor=pointer]
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]: Internship
              - heading "Software Engineering Intern" [level=3] [ref=e71]
              - paragraph [ref=e72]: Hyderabad, India · 3 openings · 2026-12-31
              - generic [ref=e73]:
                - generic [ref=e74]: Published
                - text: · 0 applications
            - generic [ref=e75]:
              - button "View Details" [ref=e76] [cursor=pointer]
              - button "Close" [ref=e77] [cursor=pointer]
  - button "Open SkillAura AI Assistant" [ref=e78]:
    - generic [aria-hidden]: ✦
```