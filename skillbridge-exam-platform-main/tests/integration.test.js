const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile, spawn } = require("node:child_process");
const { promisify } = require("node:util");
const test = require("node:test");

const execFileAsync = promisify(execFile);
const projectDir = path.resolve(__dirname, "..");
const serverPath = path.join(projectDir, "server.js");
const sharedSecret = "integration-test-shared-secret";

function randomPort() {
    return 32000 + Math.floor(Math.random() * 1000);
}

function waitForServer(child, port) {
    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:${port}/admin-login.html`);
                if (response.ok) {
                    clearInterval(timer);
                    resolve();
                }
            } catch (_) {}
        }, 50);
        child.once("exit", (code) => {
            clearInterval(timer);
            reject(new Error(`Exam Portal exited before starting: ${code}`));
        });
        setTimeout(() => {
            clearInterval(timer);
            reject(new Error("Timed out waiting for Exam Portal"));
        }, 10000);
    });
}

function startPortal({ databasePath, port, nodeEnv = "development", skillAuraPort }) {
    const child = spawn(process.execPath, [serverPath], {
        cwd: projectDir,
        env: {
            ...process.env,
            PORT: String(port),
            NODE_ENV: nodeEnv,
            DATABASE_PATH: databasePath,
            SESSION_SECRET: "integration-test-session-secret",
            SESSION_COOKIE_SAMESITE: "lax",
            SESSION_COOKIE_SECURE: nodeEnv === "production" ? "true" : "false",
            SKILLAURA_BASE_URL: `http://127.0.0.1:${skillAuraPort}`,
            EXAM_PORTAL_BASE_URL: `http://localhost:${port}`,
            SSO_SHARED_SECRET: sharedSecret,
            GOOGLE_DRIVE_DISABLED: "true"
        },
        stdio: ["ignore", "pipe", "pipe"]
    });
    child.stdout.resume();
    child.stderr.resume();
    return child;
}

function stopPortal(child) {
    return new Promise((resolve) => {
        if (child.exitCode !== null) return resolve();
        child.once("exit", resolve);
        child.kill("SIGTERM");
        setTimeout(() => {
            if (child.exitCode === null) child.kill("SIGKILL");
        }, 1000);
    });
}

function cookieHeader(response) {
    return response.headers.get("set-cookie")?.split(";")[0] || "";
}

async function login(port) {
    const response = await fetch(`http://localhost:${port}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student.demo", password: "DemoStudent123!" })
    });
    assert.equal(response.status, 200);
    return cookieHeader(response);
}

async function createSkillAuraMock(port) {
    const mock = http.createServer((request, response) => {
        if (request.url !== "/api/auth/exam-exchange" || request.method !== "POST" || request.headers["x-skillaura-sso-secret"] !== sharedSecret) {
            response.writeHead(401, { "Content-Type": "application/json" });
            return response.end(JSON.stringify({ error: "Unauthorized" }));
        }
        let body = "";
        request.on("data", (chunk) => { body += chunk; });
        request.on("end", () => {
            const users = {
                "student-code": { id: "skill-student-1", role: "student", email: "student@example.test", name: "Student User" },
                "tutor-code": { id: "skill-tutor-1", role: "tutor", email: "tutor@example.test", name: "Tutor User" },
                "employee-code": { id: "skill-employee-1", role: "student", originalRole: "employee", email: "employee@example.test", name: "Employee User" }
            };
            const user = users[JSON.parse(body || "{}").code];
            response.writeHead(user ? 200 : 401, { "Content-Type": "application/json" });
            response.end(JSON.stringify(user ? { user } : { error: "Invalid launch" }));
        });
    });
    await new Promise((resolve) => mock.listen(port, "127.0.0.1", resolve));
    return mock;
}

test("persistent Express session survives a normal restart", async () => {
    const databasePath = path.join(os.tmpdir(), `exam-session-${process.pid}-${Date.now()}.db`);
    const port = randomPort();
    const skillAuraPort = randomPort();
    let portal = startPortal({ databasePath, port, skillAuraPort });
    try {
        await waitForServer(port);
        const cookie = await login(port);
        await stopPortal(portal);
        portal = startPortal({ databasePath, port, skillAuraPort });
        await waitForServer(port);
        const profile = await fetch(`http://localhost:${port}/api/student/profile`, { headers: { Cookie: cookie } });
        assert.equal(profile.status, 200);
    } finally {
        await stopPortal(portal);
        for (const suffix of ["", "-shm", "-wal"]) fs.rmSync(`${databasePath}${suffix}`, { force: true });
    }
});

test("SSO callback maps learner roles to a normal student session", async () => {
    const databasePath = path.join(os.tmpdir(), `exam-sso-${process.pid}-${Date.now()}.db`);
    const port = randomPort();
    const skillAuraPort = randomPort();
    const skillAura = await createSkillAuraMock(skillAuraPort);
    let portal = startPortal({ databasePath, port, skillAuraPort });
    try {
        await waitForServer(port);
        for (const code of ["student-code", "tutor-code", "employee-code"]) {
            const response = await fetch(`http://localhost:${port}/sso/launch?code=${code}`, { redirect: "manual" });
            assert.equal(response.status, 302);
            assert.equal(response.headers.get("location"), "/student-portal.html");
            const profile = await fetch(`http://localhost:${port}/api/student/profile`, { headers: { Cookie: cookieHeader(response) } });
            assert.equal(profile.status, 200);
            const admin = await fetch(`http://localhost:${port}/admin.html`, { headers: { Cookie: cookieHeader(response) }, redirect: "manual" });
            assert.equal(admin.status, 302);
        }
    } finally {
        await stopPortal(portal);
        await new Promise((resolve) => skillAura.close(resolve));
        for (const suffix of ["", "-shm", "-wal"]) fs.rmSync(`${databasePath}${suffix}`, { force: true });
    }
});

test("production login cookie is Secure, HttpOnly, and SameSite=Lax", async () => {
    const databasePath = path.join(os.tmpdir(), `exam-cookie-${process.pid}-${Date.now()}.db`);
    const port = randomPort();
    const skillAuraPort = randomPort();
    let portal = startPortal({ databasePath, port, skillAuraPort, nodeEnv: "production" });
    try {
        await waitForServer(port);
        const response = await fetch(`http://localhost:${port}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "student.demo", password: "DemoStudent123!" })
        });
        const cookie = response.headers.get("set-cookie") || "";
        assert.equal(response.status, 200);
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /Secure/);
        assert.match(cookie, /SameSite=Lax/);
    } finally {
        await stopPortal(portal);
        for (const suffix of ["", "-shm", "-wal"]) fs.rmSync(`${databasePath}${suffix}`, { force: true });
    }
});

test("exam attempt result remains after a server restart", async () => {
    const databasePath = path.join(os.tmpdir(), `exam-result-${process.pid}-${Date.now()}.db`);
    const port = randomPort();
    const skillAuraPort = randomPort();
    let portal = startPortal({ databasePath, port, skillAuraPort });
    try {
        await waitForServer(port);
        const dbModule = require("better-sqlite3");
        const db = new dbModule(databasePath);
        db.prepare("INSERT INTO exams (id, title, duration, questions, admin_id, created_at) VALUES (?, ?, ?, ?, ?, ?)").run("integration-exam", "Integration Exam", 10, JSON.stringify([{ id: "integration-q-1", question: "One?", options: ["A", "B", "C", "D"], answer: "A" }]), 1, new Date().toISOString());
        db.close();
        const cookie = await login(port);
        const form = new FormData();
        form.set("examId", "integration-exam");
        form.set("answers", JSON.stringify({ "integration-q-1": "integration-q-1-option-0" }));
        form.set("questionIds", JSON.stringify(["integration-q-1"]));
        form.set("status", "completed");
        const submitted = await fetch(`http://localhost:${port}/api/attempts`, { method: "POST", headers: { Cookie: cookie }, body: form });
        assert.equal(submitted.status, 200);
        const attemptId = (await submitted.json()).attemptId;
        await stopPortal(portal);
        portal = startPortal({ databasePath, port, skillAuraPort });
        await waitForServer(port);
        const result = await fetch(`http://localhost:${port}/api/attempts/${attemptId}`, { headers: { Cookie: cookie } });
        assert.equal(result.status, 200);
        assert.equal((await result.json()).result.examTitle, "Integration Exam");
    } finally {
        await stopPortal(portal);
        for (const suffix of ["", "-shm", "-wal"]) fs.rmSync(`${databasePath}${suffix}`, { force: true });
    }
});
