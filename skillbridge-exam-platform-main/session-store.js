const session = require("express-session");

class SQLiteSessionStore extends session.Store {
    constructor(db) {
        super();
        this.db = db;
        this.getStatement = db.prepare("SELECT session FROM express_sessions WHERE sid = ? AND expires_at > ?");
        this.setStatement = db.prepare("INSERT INTO express_sessions (sid, session, expires_at) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET session = excluded.session, expires_at = excluded.expires_at");
        this.destroyStatement = db.prepare("DELETE FROM express_sessions WHERE sid = ?");
        this.touchStatement = db.prepare("UPDATE express_sessions SET expires_at = ? WHERE sid = ?");
        this.clearStatement = db.prepare("DELETE FROM express_sessions");
        this.lengthStatement = db.prepare("SELECT COUNT(*) AS count FROM express_sessions WHERE expires_at > ?");
        this.cleanupStatement = db.prepare("DELETE FROM express_sessions WHERE expires_at <= ?");
    }

    cleanup() {
        this.cleanupStatement.run(Date.now());
    }

    get(sid, callback) {
        try {
            this.cleanup();
            const row = this.getStatement.get(sid, Date.now());
            callback(null, row ? JSON.parse(row.session) : null);
        } catch (error) {
            callback(error);
        }
    }

    set(sid, sessionData, callback) {
        try {
            const expiresAt = sessionData.cookie?.expires
                ? new Date(sessionData.cookie.expires).getTime()
                : Date.now() + Number(sessionData.cookie?.maxAge || 86400000);
            this.setStatement.run(sid, JSON.stringify(sessionData), expiresAt);
            if (callback) callback(null);
        } catch (error) {
            if (callback) callback(error);
        }
    }

    destroy(sid, callback) {
        try {
            this.destroyStatement.run(sid);
            if (callback) callback(null);
        } catch (error) {
            if (callback) callback(error);
        }
    }

    touch(sid, sessionData, callback) {
        try {
            const expiresAt = sessionData.cookie?.expires
                ? new Date(sessionData.cookie.expires).getTime()
                : Date.now() + Number(sessionData.cookie?.maxAge || 86400000);
            this.touchStatement.run(expiresAt, sid);
            if (callback) callback(null);
        } catch (error) {
            if (callback) callback(error);
        }
    }

    clear(callback) {
        try {
            this.clearStatement.run();
            if (callback) callback(null);
        } catch (error) {
            if (callback) callback(error);
        }
    }

    length(callback) {
        try {
            this.cleanup();
            callback(null, this.lengthStatement.get(Date.now()).count);
        } catch (error) {
            callback(error);
        }
    }
}

module.exports = SQLiteSessionStore;