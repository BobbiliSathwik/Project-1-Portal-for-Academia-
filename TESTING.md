# SkillAura Prototype Testing

## Run locally

Node.js 18 or newer is required because the server uses native `fetch` and `AbortSignal.timeout`.

```sh
npm run dev
```

Open `http://localhost:4173`. The server serves the existing static prototype and exposes `/api/health` and `/api/ai/chat`.

The AI provider is optional. To enable the real provider adapter, configure these environment variables before starting the server:

```sh
AI_API_KEY=your-provider-key AI_MODEL=gpt-4o-mini npm run dev
```

`AI_BASE_URL` may be set for an OpenAI-compatible provider. No key is stored in frontend code or localStorage. Without a key, the endpoint returns `503 AI_NOT_CONFIGURED` and the frontend uses its grounded local assistant.

## Manual checklist

- [ ] **A: Student login**: use `student@skillaura.demo` / `Student@123`; confirm Student Dashboard opens.
- [ ] **B: Company login**: use `company@skillaura.demo` / `Company@123`; confirm Company Dashboard opens.
- [ ] **C: Institution login**: use `institution@skillaura.demo` / `Institution@123`; confirm Institution Dashboard opens.
- [ ] **D: Skill assessment**: Student > My Skills > Add Skill Assessment; answer questions, submit, and confirm score, topic breakdown, and persisted result.
- [ ] **E: Mock interview**: Student > Interviews > Start Mock Interview; select role and difficulty, answer Question 1, evaluate it, continue, complete the interview, and confirm final score, strong areas, weak areas, and feedback.
- [ ] **F: Student application**: Student > Opportunities > View details > Apply; confirm the application appears under Applications.
- [ ] **G: Company shortlist**: Company > Applications; advance or shortlist the student and confirm the application stage changes.
- [ ] **H: Institution progress**: Institution > Students; open a student and confirm available skill and application progress is shown.
- [ ] **I: Chatbot**: open SkillAura AI, send a question, confirm a response appears and the send button is disabled during processing.
- [ ] **J: AI unavailable**: run without `AI_API_KEY`; confirm the local grounded assistant responds and the page remains functional. With a provider configured, stop or block the provider and confirm a friendly fallback appears.
- [ ] **K: Themes**: switch Light/Dark mode and verify chatbot, interview forms, dashboards, buttons, and result cards remain readable.
- [ ] **L: Refresh**: refresh during an authenticated session; confirm authentication, assessment data, interview results, and prototype records remain available.
- [ ] **M: Logout**: log out and confirm protected routes redirect to login.

## Static checks

Run when Node.js is available:

```sh
npm run check
```

The current development environment did not provide Node.js, npm, or browser automation, so live browser execution was not claimed here. Editor diagnostics and `git diff --check` were run after the implementation.
