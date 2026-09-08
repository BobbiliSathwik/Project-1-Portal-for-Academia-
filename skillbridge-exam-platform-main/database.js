const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database("exam-platform.db");

// -------------------------
// Admins
// -------------------------

db.prepare(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'examiner'
    )
`).run();

// -------------------------
// Exams
// -------------------------

db.prepare(`
    CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        duration INTEGER NOT NULL,
        questions TEXT NOT NULL,
        admin_id INTEGER NOT NULL,
        created_at TEXT NOT NULL
    )
`).run();

// -------------------------
// Question Banks
// -------------------------

db.prepare(`
    CREATE TABLE IF NOT EXISTS question_banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        questions TEXT NOT NULL,
        admin_id INTEGER NOT NULL,
        created_at TEXT NOT NULL
    )
`).run();


// -------------------------
// Exam attempts / monthly eligibility
// -------------------------
db.prepare(`
    CREATE TABLE IF NOT EXISTS exam_attempts (
        id TEXT PRIMARY KEY,
        student_id INTEGER NOT NULL,
        exam_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL DEFAULT 'completed',
        UNIQUE(student_id, exam_id, id)
    )
`).run();

// Recording metadata (safe migrations for existing databases)
try { db.prepare("ALTER TABLE exam_attempts ADD COLUMN video_path TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE exam_attempts ADD COLUMN drive_file_id TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE exam_attempts ADD COLUMN score INTEGER").run(); } catch (e) {}
try { db.prepare("ALTER TABLE exam_attempts ADD COLUMN total INTEGER").run(); } catch (e) {}
try { db.prepare("ALTER TABLE exam_attempts ADD COLUMN answers TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE exam_attempts ADD COLUMN question_ids TEXT").run(); } catch (e) {}

console.log("Database ready.");

module.exports = db;

// -------------------------
// Demo student profile + results
// -------------------------
db.prepare(`
    CREATE TABLE IF NOT EXISTS student_profiles (
        admin_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        class_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        joined_date TEXT NOT NULL,
        institution TEXT,
        department TEXT,
        bio TEXT
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS demo_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_name TEXT NOT NULL,
        exam_date TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Completed'
    )
`).run();

// Seed a complete demo student account once.
const demoEmail = "student.demo";
const demoPassword = "DemoStudent123!";
let demoStudent = db.prepare("SELECT * FROM admins WHERE email = ?").get(demoEmail);
if (!demoStudent) {
    const info = db.prepare(`
        INSERT INTO admins (email, password, role) VALUES (?, ?, 'student')
    `).run(demoEmail, bcrypt.hashSync(demoPassword, 10));
    demoStudent = db.prepare("SELECT * FROM admins WHERE id = ?").get(info.lastInsertRowid);
}

db.prepare(`
    INSERT OR IGNORE INTO student_profiles
    (admin_id, full_name, student_id, class_name, email, phone, joined_date, institution, department, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
    demoStudent.id,
    "Aarav Sharma",
    "SB2026-1042",
    "B.Tech CSE",
    "aarav.demo@skillbridge.test",
    "+91 90000 00000",
    "June 2026",
    "SkillBridge Demo University",
    "Computer Science & Engineering",
    "Demo student profile for showcasing the SkillBridge student experience."
);

const resultCount = db.prepare("SELECT COUNT(*) AS count FROM demo_results WHERE student_id = ?").get(demoStudent.id).count;
if (resultCount === 0) {
    const insertResult = db.prepare(`
        INSERT INTO demo_results (student_id, exam_name, exam_date, score, total, duration)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    [
        ["Mathematics", "2026-05-05", 15, 20, 28],
        ["DBMS", "2026-05-20", 16, 20, 30],
        ["Python Fundamentals", "2026-06-05", 19, 20, 26],
        ["Computer Networks", "2026-06-18", 16, 20, 29],
        ["Data Structures", "2026-07-15", 17, 20, 31],
        ["C Programming", "2026-08-12", 18, 20, 27]
    ].forEach(r => insertResult.run(demoStudent.id, ...r));
}

console.log("Demo student ready: student.demo / DemoStudent123!");
