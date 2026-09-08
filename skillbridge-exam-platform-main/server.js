const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const svgCaptcha = require("svg-captcha");
const db = require("./database");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------
// Basic server setup
// -------------------------

app.use(cors());
app.use(express.json());

app.use(session({
    secret: "exam-platform-secret",
    resave: false,
    saveUninitialized: false
}));

app.get("/admin.html", (req, res) => {
    if (
        !req.session.adminId ||
        req.session.role !== "examiner"
    ) {
        return res.redirect("/admin-login.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "admin.html")
    );
});
app.get("/student-portal.html", (req, res) => {
    if (
        !req.session.adminId ||
        req.session.role !== "student"
    ) {
        return res.redirect("/admin-login.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "student-portal.html")
    );
});

app.use(express.static("public", {
    index: false
}));

app.get("/", (req, res) => {
    if (req.session.adminId) {
        if (req.session.role === "examiner") {
            return res.redirect("/admin.html");
        }

        if (req.session.role === "student") {
            return res.redirect("/student-portal.html");
        }
    }

    res.sendFile(
        path.join(__dirname, "public", "admin-login.html")
    );
});

// Make sure uploads folder exists
fs.mkdirSync("uploads", { recursive: true });
fs.mkdirSync(path.join("uploads", "recordings"), { recursive: true });
app.use("/recordings", express.static(path.join(__dirname, "uploads", "recordings")));

const upload = multer({
    dest: "uploads/"
});
const questionBankUpload = multer({
    dest: "question-banks/",
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() !== ".txt") {
            return cb(new Error("Only .txt files are allowed."));
        }

        cb(null, true);
    }
});
// -------------------------
// Question Bank Upload
// -------------------------

app.post(
    "/api/question-banks/upload",
    questionBankUpload.single("questionBank"),
    (req, res) => {

        if (!req.session.adminId || req.session.role !== "examiner") {
            return res.status(403).json({
                success: false,
                error: "Examiner access required."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Please upload a .txt file."
            });
        }

        try {

            console.log(
                "Question bank uploaded:",
                req.file.originalname
            );

            const content = fs.readFileSync(
                req.file.path,
                "utf8"
            );

            // Delete temporary uploaded file
            fs.unlinkSync(req.file.path);

            if (!content.trim()) {
                return res.status(400).json({
                    success: false,
                    error: "The question bank is empty."
                });
            }

            // Split questions by blank lines
            const blocks = content
                .split(/\n\s*\n/)
                .map(block => block.trim())
                .filter(block => block.length > 0);

            const questions = [];

            for (const block of blocks) {

                const lines = block
                    .split("\n")
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                if (lines.length < 6) {
                    continue;
                }

                const question =
                    lines[0].replace(/^Q\d+:\s*/i, "");

                const options = [
                    lines[1].replace(/^A\)\s*/i, ""),
                    lines[2].replace(/^B\)\s*/i, ""),
                    lines[3].replace(/^C\)\s*/i, ""),
                    lines[4].replace(/^D\)\s*/i, "")
                ];

                const answer =
                    lines[5]
                        .replace(/^ANSWER:\s*/i, "")
                        .trim()
                        .toUpperCase();

                if (
                    question &&
                    options.every(option => option) &&
                    ["A", "B", "C", "D"].includes(answer)
                ) {
                    // Optional difficulty metadata. Accept either:
                    // DIFFICULTY: EASY / MEDIUM / HARD
                    // in the block (recommended for adaptive exams).
                    const difficultyLine = lines.find(line => /^DIFFICULTY:\s*/i.test(line));
                    const rawDifficulty = difficultyLine
                        ? difficultyLine.replace(/^DIFFICULTY:\s*/i, "").trim().toLowerCase()
                        : "";
                    const difficulty = ["easy", "medium", "hard"].includes(rawDifficulty)
                        ? rawDifficulty
                        : null;

                    questions.push({
                        question,
                        options,
                        answer,
                        difficulty
                    });
                }
            }

            // Make sure at least one valid question exists
            if (questions.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "No valid questions were found. Check the .txt format."
                });
            }

            // Save question bank
            const result = db.prepare(`
                INSERT INTO question_banks
                (name, questions, admin_id, created_at)
                VALUES (?, ?, ?, ?)
            `).run(
                req.file.originalname.replace(/\.txt$/i, ""),
                JSON.stringify(questions),
                req.session.adminId,
                new Date().toISOString()
            );

            console.log(
                "Question bank saved:",
                result.lastInsertRowid
            );

            return res.json({
                success: true,
                bankId: result.lastInsertRowid,
                name: req.file.originalname,
                questionCount: questions.length
            });

        } catch (error) {

            console.error(
                "Question bank upload error:",
                error
            );

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    error: "Could not upload question bank."
                });
            }
        }
    }
);
// -------------------------
// Question Bank APIs
// -------------------------

app.get("/api/question-banks", (req, res) => {

    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({
            success: false,
            error: "Examiner access required."
        });
    }

    try {

        const banks = db.prepare(`
            SELECT id, name, questions, created_at
            FROM question_banks
            WHERE admin_id = ?
            ORDER BY id DESC
        `).all(req.session.adminId);

        const formattedBanks = banks.map(bank => {

            const questions = JSON.parse(bank.questions);

            return {
                id: bank.id,
                name: bank.name,
                questionCount: questions.length,
                created_at: bank.created_at
            };

        });

        return res.json({
            success: true,
            banks: formattedBanks
        });

    } catch (error) {

        console.error("Question bank list error:", error);

        return res.status(500).json({
            success: false,
            error: "Could not load question banks."
        });
    }
});


app.get("/api/question-banks/:id", (req, res) => {

    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({
            success: false,
            error: "Examiner access required."
        });
    }

    try {

        const bank = db.prepare(`
            SELECT id, name, questions, created_at
            FROM question_banks
            WHERE id = ? AND admin_id = ?
        `).get(
            req.params.id,
            req.session.adminId
        );

        if (!bank) {
            return res.status(404).json({
                success: false,
                error: "Question bank not found."
            });
        }

        bank.questions = JSON.parse(bank.questions);

        return res.json({
            success: true,
            bank
        });

    } catch (error) {

        console.error("Question bank view error:", error);

        return res.status(500).json({
            success: false,
            error: "Could not load question bank."
        });
    }
});


app.delete("/api/question-banks/:id", (req, res) => {

    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({
            success: false,
            error: "Examiner access required."
        });
    }

    try {

        const result = db.prepare(`
            DELETE FROM question_banks
            WHERE id = ? AND admin_id = ?
        `).run(
            req.params.id,
            req.session.adminId
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: "Question bank not found."
            });
        }

        return res.json({
            success: true,
            message: "Question bank deleted."
        });

    } catch (error) {

        console.error("Question bank delete error:", error);

        return res.status(500).json({
            success: false,
            error: "Could not delete question bank."
        });
    }
});

// -------------------------
// Exam data
// -------------------------
const exams = {};
const attempts = {};
app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;

    const admin = db.prepare(`
        SELECT * FROM admins
        WHERE email = ?
    `).get(email);

    if (!admin) {
        return res.status(401).json({
            success: false,
            error: "Invalid email or password."
        });
    }
    const passwordCorrect =
        bcrypt.compareSync(password, admin.password);

    if (!passwordCorrect) {
        return res.status(401).json({
            success: false,
            error: "Invalid email or password."
        });
    }

   req.session.adminId = admin.id;
req.session.adminEmail = admin.email;
req.session.role = admin.role;

res.json({
    success: true,
    role: admin.role
});
});


app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({
            success: true
        });
    });
});


// -------------------------
// Student demo data
// -------------------------
app.get("/api/student/profile", (req, res) => {
    if (!req.session.adminId || req.session.role !== "student") {
        return res.status(403).json({ success: false, error: "Student access required." });
    }
    const profile = db.prepare(`
        SELECT full_name, student_id, class_name, email, phone, joined_date, institution, department, bio
        FROM student_profiles WHERE admin_id = ?
    `).get(req.session.adminId);

    // The exam portal must work with the main site's student account even when
    // that account does not yet have a row in the optional demo profile table.
    // Use the authenticated username/email as a safe fallback instead of
    // forcing the student to log in again or type their name.
    if (!profile) {
        const account = db.prepare(`
            SELECT id, email FROM admins WHERE id = ? AND role = 'student'
        `).get(req.session.adminId);

        if (!account) {
            return res.status(404).json({ success: false, error: "Student account not found." });
        }

        const fallbackName = String(account.email || 'Student')
            .split('@')[0]
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        return res.json({
            success: true,
            profile: {
                full_name: fallbackName,
                student_id: `SB-${account.id}`,
                class_name: 'Student',
                email: account.email,
                phone: '',
                joined_date: '',
                institution: '',
                department: '',
                bio: ''
            }
        });
    }

    res.json({ success: true, profile });
});

app.get("/api/student/results", (req, res) => {
    if (!req.session.adminId || req.session.role !== "student") {
        return res.status(403).json({ success: false, error: "Student access required." });
    }
    const results = db.prepare(`
        SELECT exam_name, exam_date, score, total, duration, status
        FROM demo_results WHERE student_id = ? ORDER BY exam_date ASC
    `).all(req.session.adminId);
    const completed = results.length;
    const points = results.reduce((sum, r) => sum + r.score, 0);
    const possible = results.reduce((sum, r) => sum + r.total, 0);
    const percentages = results.map(r => Math.round((r.score / r.total) * 100));
    res.json({
        success: true, results,
        stats: {
            completed,
            average: completed ? Math.round(percentages.reduce((a,b) => a+b, 0) / completed) : 0,
            best: completed ? Math.max(...percentages) : 0,
            totalQuestions: possible,
            accuracy: possible ? Math.round((points / possible) * 100) : 0
        }
    });
});

// -------------------------
// Google Drive
// -------------------------

const SCOPES = [
    "https://www.googleapis.com/auth/drive.file"
];

let drive;

// Authenticate with Google Drive
async function authorizeGoogleDrive() {
    console.log("Connecting to Google Drive...");

    // Login using Google's local authentication
    const auth = await authenticate({
        scopes: SCOPES,
        keyfilePath: path.join(
            __dirname,
            "credentials.json"
        )
    });

    console.log("Google authentication successful.");

    // Read the OAuth client information
    const credentialsFile = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "credentials.json"),
            "utf8"
        )
    );

    const keys =
        credentialsFile.installed ||
        credentialsFile.web;

    if (!keys) {
        throw new Error(
            "Could not find installed/web OAuth credentials."
        );
    }

    // Create the OAuth client from the SAME library
    // used by googleapis
    const oauth2Client = new google.auth.OAuth2(
        keys.client_id,
        keys.client_secret,
        keys.redirect_uris[0]
    );

    // Transfer the tokens obtained during login
    oauth2Client.setCredentials(
        auth.credentials
    );

    // Make sure we have a usable access token
    const token =
        await oauth2Client.getAccessToken();

    if (!token.token) {
        throw new Error(
            "No Google access token was available."
        );
    }

    console.log("Google access token received.");

    // IMPORTANT: Drive now uses googleapis' own OAuth client
    drive = google.drive({
        version: "v3",
        auth: oauth2Client
    });

    console.log(
        "Google Drive connected successfully!"
    );
}
// -------------------------
// Create exam
// -------------------------

app.post("/api/exams", (req, res) => {

    const {
        title,
        duration,
        bankId,
        questionCount
    } = req.body;

    // Check examiner login
    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({
            success: false,
            error: "Examiner access required."
        });
    }

    // Validate basic information
    if (!title || !duration || !bankId || !questionCount) {
        return res.status(400).json({
            success: false,
            error: "Please provide exam title, duration, question bank and question count."
        });
    }

    try {

        // Get the selected question bank
        const bank = db.prepare(`
            SELECT id, name, questions
            FROM question_banks
            WHERE id = ? AND admin_id = ?
        `).get(
            bankId,
            req.session.adminId
        );

        if (!bank) {
            return res.status(404).json({
                success: false,
                error: "Question bank not found."
            });
        }

        // Convert stored questions back into an array
        const questions = JSON.parse(bank.questions);

        // Make sure requested number is possible
        if (
            Number(questionCount) < 1 ||
            Number(questionCount) > questions.length
        ) {
            return res.status(400).json({
                success: false,
                error: `This question bank contains ${questions.length} questions.`
            });
        }

        // Generate exam ID
        const examId =
            Math.random()
                .toString(36)
                .substring(2, 8);

        /*
         * For now we store the question bank information
         * with the exam.
         *
         * Later, when a student starts the exam,
         * the server will randomly select the required
         * number of questions from this bank.
         */
        const examData = {
            bankId: Number(bankId),
            questionCount: Number(questionCount),
            adaptive: true,
            adaptiveBatchSize: 5
        };

        // Save exam
        db.prepare(`
            INSERT INTO exams
            (id, title, duration, questions, admin_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            examId,
            title,
            Number(duration),
            JSON.stringify(examData),
            req.session.adminId,
            new Date().toISOString()
        );

        console.log(
            "Exam saved to database:",
            examId
        );

        return res.json({
            success: true,
            examId: examId
        });

    } catch (error) {

        console.error(
            "Exam creation error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Could not create exam."
        });
    }
});

// -------------------------
// 30-day exam eligibility
// -------------------------
const EXAM_COOLDOWN_DAYS = 30;
const EXAM_COOLDOWN_MS = EXAM_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

function getLatestAttempt(studentId, examId) {
    return db.prepare(`
        SELECT id, started_at, completed_at, status
        FROM exam_attempts
        WHERE student_id = ?
          AND exam_id = ?
        ORDER BY started_at DESC
        LIMIT 1
    `).get(studentId, examId);
}

function getExamEligibility(studentId, examId) {
    const attempt = getLatestAttempt(studentId, examId);
    if (!attempt) {
        return { canAttempt: true, attemptedRecently: false, nextAvailableAt: null };
    }

    const startedAt = new Date(attempt.started_at);
    const nextAvailableAt = new Date(startedAt.getTime() + EXAM_COOLDOWN_MS);
    const canAttempt = Date.now() >= nextAvailableAt.getTime();

    return {
        canAttempt,
        attemptedRecently: !canAttempt,
        nextAvailableAt: nextAvailableAt.toISOString(),
        lastAttemptAt: attempt.started_at
    };
}

// -------------------------
// Get exams
// -------------------------
app.get("/api/exams", (req, res) => {

    if (!req.session.adminId || !["student", "examiner"].includes(req.session.role)) {
        return res.status(401).json({
            error: "Login required."
        });
    }

    try {

        const exams = req.session.role === "examiner"
            ? db.prepare(`
                SELECT id, title, duration, questions, admin_id, created_at
                FROM exams
                WHERE admin_id = ?
                ORDER BY created_at DESC
            `).all(req.session.adminId)
            : db.prepare(`
                SELECT id, title, duration, questions, created_at
                FROM exams
                ORDER BY created_at DESC
            `).all();

        const formattedExams = exams.map(exam => {

            const examData = JSON.parse(exam.questions);

            const eligibility = req.session.role === "student"
                ? getExamEligibility(req.session.adminId, exam.id)
                : { canAttempt: true, attemptedRecently: false, nextAvailableAt: null };

            return {
                id: exam.id,
                title: exam.title,
                duration: exam.duration,
                questionCount: examData.questionCount,
                created_at: exam.created_at,
                canAttempt: eligibility.canAttempt,
                attemptedRecently: eligibility.attemptedRecently,
                nextAvailableAt: eligibility.nextAvailableAt,
                lastAttemptAt: eligibility.lastAttemptAt || null
            };

        });

        res.json(formattedExams);

    } catch (error) {

        console.error("Load exams error:", error);

        res.status(500).json({
            error: "Could not load exams."
        });
    }
});


// -------------------------
// Delete exam (examiner only)
// -------------------------
app.delete("/api/exams/:id", (req, res) => {

    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({
            success: false,
            error: "Examiner access required."
        });
    }

    try {
        const exam = db.prepare(`
            SELECT id, title
            FROM exams
            WHERE id = ? AND admin_id = ?
        `).get(req.params.id, req.session.adminId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: "Exam not found."
            });
        }

        db.prepare(`
            DELETE FROM exams
            WHERE id = ? AND admin_id = ?
        `).run(req.params.id, req.session.adminId);

        return res.json({
            success: true,
            message: `\"${exam.title}\" was deleted successfully.`
        });
    } catch (error) {
        console.error("Exam delete error:", error);
        return res.status(500).json({
            success: false,
            error: "Could not delete exam."
        });
    }
});

// -------------------------
// Get single exam
// -------------------------
function normalizeDifficulty(value, index, total) {
    const normalized = String(value || "").trim().toLowerCase();
    if (["easy", "medium", "hard"].includes(normalized)) {
        return normalized;
    }

    // Backward-compatible default for older question banks that do not
    // contain difficulty metadata: split the bank into 3 tiers.
    const ratio = total > 0 ? index / total : 0;
    if (ratio < 0.34) return "easy";
    if (ratio < 0.67) return "medium";
    return "hard";
}

function difficultyRank(level) {
    return { easy: 0, medium: 1, hard: 2 }[level] ?? 1;
}

function nextDifficulty(level, score, batchSize = 5) {
    const rank = difficultyRank(level);
    if (score >= Math.ceil(batchSize * 0.8)) {
        return ["easy", "medium", "hard"][Math.min(2, rank + 1)];
    }
    if (score <= Math.floor(batchSize * 0.4)) {
        return ["easy", "medium", "hard"][Math.max(0, rank - 1)];
    }
    return level;
}

function buildAdaptiveQuestionPool(bankQuestions, bankId) {
    const total = bankQuestions.length;
    return bankQuestions.map((q, originalIndex) => ({
        ...q,
        id: q.id || `bank-${bankId}-q-${originalIndex + 1}`,
        __bankIndex: originalIndex,
        difficulty: normalizeDifficulty(q.difficulty, originalIndex, total)
    }));
}

function shuffleServer(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function publicQuestion(question) {
    const optionTexts = Array.isArray(question.options)
        ? question.options.slice(0, 4)
        : ["A", "B", "C", "D"].map(letter => question.options?.[letter]);

    const correctOriginalIndex = {
        A: 0,
        B: 1,
        C: 2,
        D: 3
    }[String(question.answer || question.correctAnswer || "").toUpperCase()];

    const shuffledOptions = shuffleServer(
        optionTexts.map((text, originalIndex) => ({
            id: `${question.id}-option-${originalIndex}`,
            text
        }))
    );

    return {
        id: question.id,
        question: question.question,
        options: shuffledOptions,
        __correctOptionId: `${question.id}-option-${correctOriginalIndex}`,
        __bankIndex: question.__bankIndex,
        difficulty: question.difficulty
    };
}

function selectAdaptiveBatch(pool, targetDifficulty, excludedIds, count) {
    const excluded = new Set((excludedIds || []).map(String));
    const target = shuffleServer(pool.filter(q => q.difficulty === targetDifficulty && !excluded.has(String(q.id))));

    const selected = target.slice(0, count);
    if (selected.length >= count) return selected;

    // Fill remaining slots from the nearest difficulty tiers so an imperfect
    // or small question bank never traps the student.
    const remaining = pool.filter(q => !excluded.has(String(q.id)) && !selected.some(x => x.id === q.id));
    remaining.sort((a, b) => Math.abs(difficultyRank(a.difficulty) - difficultyRank(targetDifficulty)) - Math.abs(difficultyRank(b.difficulty) - difficultyRank(targetDifficulty)));
    return selected.concat(shuffleServer(remaining).slice(0, count - selected.length));
}

app.get("/api/exams/:id", (req, res) => {

    if (!req.session.adminId) {
        return res.status(401).json({ error: "You must be logged in." });
    }

    const exam = db.prepare(`
        SELECT * FROM exams
        WHERE id = ?
    `).get(req.params.id);

    if (!exam) {
        return res.status(404).json({ error: "Exam not found" });
    }

    if (req.session.role === "student") {
        const eligibility = getExamEligibility(req.session.adminId, exam.id);
        if (!eligibility.canAttempt) {
            return res.status(429).json({
                success: false,
                code: "COOLDOWN_30_DAYS",
                error: "You can write this exam again only after 30 days from your last attempt.",
                nextAvailableAt: eligibility.nextAvailableAt,
                lastAttemptAt: eligibility.lastAttemptAt
            });
        }
    }

    const examData = JSON.parse(exam.questions);
    let bankId = null;
    let bankQuestions = [];

    if (Array.isArray(examData)) {
        bankQuestions = examData;
    } else if (examData && examData.bankId) {
        bankId = Number(examData.bankId);
        const bank = db.prepare(`SELECT questions FROM question_banks WHERE id = ?`).get(bankId);
        if (!bank) {
            return res.status(404).json({
                success: false,
                error: "The question bank for this exam could not be found."
            });
        }
        bankQuestions = JSON.parse(bank.questions);
    }

    const requestedCount = Math.min(
        Number(examData?.questionCount) || bankQuestions.length,
        bankQuestions.length
    );

    const batchSize = Math.max(1, Math.min(5, Number(examData?.adaptiveBatchSize) || 5));
    const adaptivePool = buildAdaptiveQuestionPool(bankQuestions, bankId || exam.id);
    const adaptiveEnabled = examData?.adaptive !== false;

    let questions;
    if (adaptiveEnabled) {
        // Start at MEDIUM. If the bank lacks enough medium questions,
        // selectAdaptiveBatch fills the remainder with nearby levels.
        const firstBatch = selectAdaptiveBatch(adaptivePool, "medium", [], Math.min(batchSize, requestedCount));
        questions = firstBatch.map(publicQuestion);
    } else {
        questions = shuffleServer(adaptivePool)
            .slice(0, requestedCount)
            .map(publicQuestion);
    }

    exam.questions = questions;
    exam.questionCount = questions.length;
    exam.totalQuestionCount = requestedCount;
    exam.adaptive = adaptiveEnabled;
    exam.adaptiveBatchSize = batchSize;
    exam.completedQuestionCount = questions.length;

    // Do not rely on the client-visible correct answer; it is stripped below.
    exam.questions = exam.questions.map(q => {
        const clean = { ...q };
        delete clean.__correctOptionId;
        return clean;
    });

    res.json(exam);
});

// Return the next adaptive batch after grading the previous 5 questions.
app.post("/api/exams/:id/adaptive-next", (req, res) => {
    if (!req.session.adminId || req.session.role !== "student") {
        return res.status(403).json({ success: false, error: "Student access required." });
    }

    try {
        const exam = db.prepare(`SELECT * FROM exams WHERE id = ?`).get(req.params.id);
        if (!exam) return res.status(404).json({ success: false, error: "Exam not found." });

        const examData = parseJsonSafe(exam.questions, {});
        const bankId = Number(examData.bankId);
        const bank = db.prepare(`SELECT questions FROM question_banks WHERE id = ?`).get(bankId);
        if (!bank) return res.status(404).json({ success: false, error: "Question bank not found." });

        const pool = buildAdaptiveQuestionPool(parseJsonSafe(bank.questions, []), bankId);
        const batchSize = Math.max(1, Math.min(5, Number(examData.adaptiveBatchSize) || 5));
        const requestedCount = Math.min(Number(examData.questionCount) || pool.length, pool.length);
        const questionIds = parseJsonSafe(req.body.questionIds, []).map(String);
        const answers = parseJsonSafe(req.body.answers, {});
        const usedIds = parseJsonSafe(req.body.usedQuestionIds, []).map(String);

        const batchQuestions = pool.filter(q => questionIds.includes(String(q.id)));
        let score = 0;
        for (const question of batchQuestions) {
            const chosen = String(answers[question.id] || "");
            const answerLetter = String(question.answer || question.correctAnswer || "").toUpperCase();
            const correctIndex = { A: 0, B: 1, C: 2, D: 3 }[answerLetter];
            const correctOptionId = `${question.id}-option-${correctIndex}`;
            if (chosen && chosen === correctOptionId) score += 1;
        }

        const currentDifficulty = batchQuestions[0]?.difficulty || "medium";
        const targetDifficulty = nextDifficulty(currentDifficulty, score, batchQuestions.length || batchSize);
        const remainingNeeded = Math.min(batchSize, Math.max(0, requestedCount - usedIds.length));

        if (remainingNeeded === 0) {
            return res.json({
                success: true,
                done: true,
                score,
                total: batchQuestions.length,
                difficulty: currentDifficulty,
                questions: [],
                completedQuestionCount: usedIds.length,
                totalQuestionCount: requestedCount
            });
        }

        const selected = selectAdaptiveBatch(pool, targetDifficulty, usedIds, remainingNeeded);
        const publicQuestions = selected.map(publicQuestion).map(q => {
            const clean = { ...q };
            delete clean.__correctOptionId;
            return clean;
        });

        res.json({
            success: true,
            done: false,
            score,
            total: batchQuestions.length,
            previousDifficulty: currentDifficulty,
            nextDifficulty: targetDifficulty,
            questions: publicQuestions,
            completedQuestionCount: usedIds.length + publicQuestions.length,
            totalQuestionCount: requestedCount
        });
    } catch (error) {
        console.error("Adaptive batch error:", error);
        res.status(500).json({ success: false, error: "Could not load the next adaptive question set." });
    }
});

// -------------------------
// Upload video to Google Drive
// -------------------------

async function uploadToDrive(
    filePath,
    fileName,
    mimeType
) {

    if (!drive) {
        throw new Error(
            "Google Drive is not connected."
        );
    }

    const response =
        await drive.files.create({

            requestBody: {
                name: fileName
            },

            media: {
                mimeType: mimeType,
                body: fs.createReadStream(filePath)
            },

            fields: "id,name,webViewLink"
        });

    return response.data;
}

// -------------------------
// Result helpers
// -------------------------
function parseJsonSafe(value, fallback) {
    try { return JSON.parse(value || ""); } catch (_) { return fallback; }
}

function getAttemptQuestions(examId, questionIds) {
    const exam = db.prepare("SELECT questions FROM exams WHERE id = ?").get(examId);
    if (!exam) return [];
    const examData = parseJsonSafe(exam.questions, {});
    if (Array.isArray(examData)) return examData;
    const bank = db.prepare("SELECT questions FROM question_banks WHERE id = ?").get(Number(examData.bankId));
    if (!bank) return [];
    const bankQuestions = parseJsonSafe(bank.questions, []);
    return questionIds.map(id => {
        const exact = bankQuestions.find(q => q.id && String(q.id) === String(id));
        if (exact) return exact;
        const match = String(id).match(/-q-(\d+)$/);
        if (match) return bankQuestions[Number(match[1]) - 1];
        return null;
    }).filter(Boolean);
}

// -------------------------
// Save exam attempt
// -------------------------

app.post(
    "/api/attempts",
    upload.single("video"),
    async (req, res) => {

        try {

            if (!req.session.adminId || req.session.role !== "student") {
                return res.status(403).json({
                    success: false,
                    error: "Student access required."
                });
            }

            const examId = String(req.body.examId || "").trim();
            if (!examId) {
                return res.status(400).json({ success: false, error: "Exam ID is required." });
            }

            const exam = db.prepare(`SELECT id, title FROM exams WHERE id = ?`).get(examId);
            if (!exam) {
                return res.status(404).json({ success: false, error: "Exam not found." });
            }

            // One attempt every 30 days per student and per exam.
            const eligibility = getExamEligibility(req.session.adminId, examId);
            if (!eligibility.canAttempt) {
                return res.status(429).json({
                    success: false,
                    code: "COOLDOWN_30_DAYS",
                    error: "You have already attempted this exam within the last 30 days.",
                    nextAvailableAt: eligibility.nextAvailableAt,
                    lastAttemptAt: eligibility.lastAttemptAt
                });
            }

            const attemptId =
                Math.random()
                    .toString(36)
                    .substring(2, 10);

            let driveFile = null;
            let localVideoPath = null;

            // ALWAYS preserve the recording locally first. This means a Google
            // Drive outage/expired OAuth token can never cause the recording to
            // disappear.
            if (req.file) {
                const safeName = `exam-${examId}-attempt-${attemptId}.webm`;
                const destination = path.join(__dirname, "uploads", "recordings", safeName);
                fs.renameSync(req.file.path, destination);
                localVideoPath = `/recordings/${safeName}`;
                console.log("Recording saved locally:", localVideoPath);

                // Then try Drive as a secondary copy.
                if (drive) {
                    try {
                        driveFile = await uploadToDrive(destination, safeName, req.file.mimetype || "video/webm");
                        console.log("Recording uploaded to Google Drive:", driveFile.id);
                    } catch (driveError) {
                        console.warn("Google Drive upload failed; local recording retained:", driveError.message);
                    }
                }
            }

            const answers = parseJsonSafe(req.body.answers, {});
            const questionIds = parseJsonSafe(req.body.questionIds, []);
            const selectedQuestions = getAttemptQuestions(examId, questionIds);
            let score = null;
            let total = null;

                        if ((req.body.status || "completed") === "completed") {
                total = selectedQuestions.length;

                score = selectedQuestions.reduce((count, question, index) => {
                    const questionId = String(questionIds[index] || "");
                    const chosenOptionId = String(
                        answers[questionId] || ""
                    );

                    const correctLetter = String(
                        question.answer || question.correctAnswer || ""
                    ).toUpperCase();

                    const correctIndex = {
                        A: 0,
                        B: 1,
                        C: 2,
                        D: 3
                    }[correctLetter];

                    const correctOptionId =
                        `${questionId}-option-${correctIndex}`;

                    return count + (
                        chosenOptionId === correctOptionId
                            ? 1
                            : 0
                    );
                }, 0);
            }

            const completedAt = new Date().toISOString();
            db.prepare(`
                INSERT INTO exam_attempts
                (id, student_id, exam_id, started_at, completed_at, status, video_path, drive_file_id, score, total, answers, question_ids)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                attemptId,
                req.session.adminId,
                examId,
                completedAt,
                completedAt,
                req.body.status || "completed",
                localVideoPath,
                driveFile ? driveFile.id : null,
                score,
                total,
                JSON.stringify(answers),
                JSON.stringify(questionIds)
            );

            // Always resolve the candidate name from the authenticated account.
            // Never trust a name supplied by the browser.
            const studentProfile = db.prepare(`
                SELECT full_name
                FROM student_profiles
                WHERE admin_id = ?
            `).get(req.session.adminId);

            const studentName = studentProfile?.full_name || req.session.adminEmail || "Student";

            attempts[attemptId] = {

                id: attemptId,

                examId:
                    req.body.examId,

                studentName,

                answers:
                    JSON.parse(
                        req.body.answers || "{}"
                    ),

                status:
                    req.body.status,

                reason:
                    req.body.reason || null,

                video:
                    driveFile
                        ? driveFile.id
                        : localVideoPath,

                time:
                    new Date().toISOString()
            };

            console.log(
                "Attempt saved:",
                attempts[attemptId]
            );

            res.json({

                success: true,

                attemptId:
                    attemptId,

                driveFileId:
                    driveFile
                        ? driveFile.id
                        : null,

                videoUrl: localVideoPath,
                score,
                total,
                percentage: total ? Math.round((score / total) * 100) : null
            });

        } catch (error) {

            console.error(
                "Upload error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    "Could not save recording."
            });
        }
    }
);

// -------------------------
// Student result
// -------------------------
app.get("/api/attempts/:id", (req, res) => {
    if (!req.session.adminId || req.session.role !== "student") {
        return res.status(403).json({ success: false, error: "Student access required." });
    }

    const attempt = db.prepare(`
        SELECT a.*, e.title AS exam_title, e.duration
        FROM exam_attempts a
        JOIN exams e ON e.id = a.exam_id
        WHERE a.id = ? AND a.student_id = ?
    `).get(req.params.id, req.session.adminId);

    if (!attempt) {
        return res.status(404).json({ success: false, error: "Result not found." });
    }

    const percentage = attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;
    const nextAvailableAt = new Date(new Date(attempt.started_at).getTime() + EXAM_COOLDOWN_MS).toISOString();
    const profile = db.prepare("SELECT full_name FROM student_profiles WHERE admin_id = ?").get(req.session.adminId);
    const account = db.prepare("SELECT email FROM admins WHERE id = ?").get(req.session.adminId);

    res.json({
        success: true,
        result: {
            attemptId: attempt.id,
            examId: attempt.exam_id,
            examTitle: attempt.exam_title,
            studentName: profile?.full_name || account?.email || "Student",
            score: attempt.score ?? 0,
            total: attempt.total ?? 0,
            percentage,
            status: attempt.status,
            completedAt: attempt.completed_at,
            nextAvailableAt,
            videoUrl: attempt.video_path || null,
            driveFileId: attempt.drive_file_id || null
        }
    });
});

// -------------------------
// Examiner: student results, performance graph data and recordings
// -------------------------
app.get("/api/admin/results", (req, res) => {
    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({ success: false, error: "Examiner access required." });
    }

    try {
        const rows = db.prepare(`
            SELECT
                a.id,
                a.student_id,
                a.exam_id,
                a.started_at,
                a.completed_at,
                a.status,
                a.score,
                a.total,
                a.video_path,
                a.drive_file_id,
                e.title AS exam_title,
                e.duration,
                COALESCE(sp.full_name, st.email, 'Student') AS student_name,
                COALESCE(sp.student_id, 'SB-' || st.id) AS student_code
            FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            JOIN admins st ON st.id = a.student_id
            LEFT JOIN student_profiles sp ON sp.admin_id = a.student_id
            WHERE e.admin_id = ?
            ORDER BY COALESCE(a.completed_at, a.started_at) DESC
        `).all(req.session.adminId);

        const results = rows.map(r => ({
            id: r.id,
            studentId: r.student_id,
            studentName: r.student_name,
            studentCode: r.student_code,
            examId: r.exam_id,
            examTitle: r.exam_title,
            score: r.score ?? 0,
            total: r.total ?? 0,
            percentage: r.total ? Math.round((r.score / r.total) * 100) : 0,
            status: r.status,
            submittedAt: r.completed_at || r.started_at,
            duration: r.duration,
            videoUrl: r.video_path || null,
            driveFileId: r.drive_file_id || null
        }));

        const students = db.prepare(`
            SELECT DISTINCT
                a.student_id AS studentId,
                COALESCE(sp.full_name, st.email, 'Student') AS studentName,
                COALESCE(sp.student_id, 'SB-' || st.id) AS studentCode
            FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            JOIN admins st ON st.id = a.student_id
            LEFT JOIN student_profiles sp ON sp.admin_id = a.student_id
            WHERE e.admin_id = ?
            ORDER BY studentName COLLATE NOCASE
        `).all(req.session.adminId);

        res.json({ success: true, results, students });
    } catch (error) {
        console.error("Admin results error:", error);
        res.status(500).json({ success: false, error: "Could not load student results." });
    }
});

app.get("/api/admin/students/:studentId/performance", (req, res) => {
    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({ success: false, error: "Examiner access required." });
    }

    try {
        const rows = db.prepare(`
            SELECT
                a.id,
                a.exam_id,
                a.completed_at,
                a.started_at,
                a.score,
                a.total,
                a.status,
                a.video_path,
                a.drive_file_id,
                e.title AS exam_title,
                COALESCE(sp.full_name, st.email, 'Student') AS student_name,
                COALESCE(sp.student_id, 'SB-' || st.id) AS student_code
            FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            JOIN admins st ON st.id = a.student_id
            LEFT JOIN student_profiles sp ON sp.admin_id = a.student_id
            WHERE a.student_id = ? AND e.admin_id = ?
            ORDER BY COALESCE(a.completed_at, a.started_at) ASC
        `).all(Number(req.params.studentId), req.session.adminId);

        if (!rows.length) {
            return res.status(404).json({ success: false, error: "No results found for this student." });
        }

        const student = {
            id: rows[0].student_id,
            name: rows[0].student_name,
            code: rows[0].student_code
        };
        const performance = rows.map(r => ({
            attemptId: r.id,
            examTitle: r.exam_title,
            percentage: r.total ? Math.round((r.score / r.total) * 100) : 0,
            score: r.score ?? 0,
            total: r.total ?? 0,
            submittedAt: r.completed_at || r.started_at,
            status: r.status,
            videoUrl: r.video_path || null,
            driveFileId: r.drive_file_id || null
        }));

        res.json({ success: true, student, performance });
    } catch (error) {
        console.error("Student performance error:", error);
        res.status(500).json({ success: false, error: "Could not load student performance." });
    }
});

app.get("/api/admin/attempts/:id", (req, res) => {
    if (!req.session.adminId || req.session.role !== "examiner") {
        return res.status(403).json({ success: false, error: "Examiner access required." });
    }

    try {
        const row = db.prepare(`
            SELECT
                a.*,
                e.title AS exam_title,
                e.duration,
                COALESCE(sp.full_name, st.email, 'Student') AS student_name,
                COALESCE(sp.student_id, 'SB-' || st.id) AS student_code
            FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            JOIN admins st ON st.id = a.student_id
            LEFT JOIN student_profiles sp ON sp.admin_id = a.student_id
            WHERE a.id = ? AND e.admin_id = ?
        `).get(req.params.id, req.session.adminId);

        if (!row) return res.status(404).json({ success: false, error: "Attempt not found." });

        res.json({
            success: true,
            result: {
                attemptId: row.id,
                studentId: row.student_id,
                studentName: row.student_name,
                studentCode: row.student_code,
                examTitle: row.exam_title,
                score: row.score ?? 0,
                total: row.total ?? 0,
                percentage: row.total ? Math.round((row.score / row.total) * 100) : 0,
                status: row.status,
                submittedAt: row.completed_at || row.started_at,
                startedAt: row.started_at,
                completedAt: row.completed_at,
                duration: row.duration,
                videoUrl: row.video_path || null,
                driveFileId: row.drive_file_id || null
            }
        });
    } catch (error) {
        console.error("Admin attempt error:", error);
        res.status(500).json({ success: false, error: "Could not load attempt." });
    }
});

// -------------------------
// Start server
// -------------------------

async function startServer() {

    try {
        try {
            await authorizeGoogleDrive();
        } catch (driveError) {
            drive = null;
            console.warn("Google Drive unavailable. Recordings will still be saved locally.");
            console.warn(driveError.message);
        }

        app.listen(
            PORT,
            () => {

                console.log("");
                console.log(
                    "================================"
                );
                console.log(
                    `Server running at http://localhost:${PORT}`
                );
                console.log(
                    "Google Drive: CONNECTED"
                );
                console.log(
                    "================================"
                );
                console.log("");
            }
        );

    } catch (error) {

        console.error("");
        console.error(
            "Google Drive authentication failed."
        );
        console.error(error);
        console.error("");
    }
}

startServer();