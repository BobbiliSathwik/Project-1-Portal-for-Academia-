const db = require("./database");

const examCount = db.prepare("SELECT COUNT(*) AS count FROM exams").get().count;
const attemptCount = db.prepare("SELECT COUNT(*) AS count FROM exam_attempts").get().count;

const transaction = db.transaction(() => {
    db.prepare("DELETE FROM exams").run();
    db.prepare("DELETE FROM exam_attempts").run();
});

transaction();

console.log(`Removed ${examCount} existing exam(s).`);
console.log(`Removed ${attemptCount} old exam attempt record(s).`);
console.log("Question banks were kept.");
