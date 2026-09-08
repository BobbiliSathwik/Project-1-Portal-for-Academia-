const db = require("./database");
const bcrypt = require("bcryptjs");

const email = "admin@example.com";
const password = "Admin123!";

const hashedPassword = bcrypt.hashSync(password, 10);

try {
    db.prepare(`
        INSERT INTO admins (email, password)
        VALUES (?, ?)
    `).run(email, hashedPassword);

    console.log("Admin account created!");
    console.log("Email:", email);
    console.log("Password:", password);
} catch (error) {
    console.log("Could not create admin:", error.message);
}