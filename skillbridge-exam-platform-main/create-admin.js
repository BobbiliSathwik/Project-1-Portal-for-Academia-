const db = require("./database");
const bcrypt = require("bcryptjs");

const email = process.env.ADMIN_EMAIL || "admin@skillbridge.local";
const password = process.env.ADMIN_PASSWORD || "Admin@26044";

if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    process.exit(1);
}

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
const hashedPassword = bcrypt.hashSync(password, 10);

if (existing) {
    db.prepare("UPDATE admins SET password = ?, role = 'examiner' WHERE id = ?").run(hashedPassword, existing.id);
    console.log("Admin account updated!");
} else {
    db.prepare("INSERT INTO admins (email, password, role) VALUES (?, ?, 'examiner')").run(email, hashedPassword);
    console.log("Admin account created!");
}

console.log("Email:", email);
console.log("Password:", password);
console.log("Role: administrator");
