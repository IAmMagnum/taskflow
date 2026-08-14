const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite database file (creates taskflow.db if it doesn't exist)
const db = new Database(path.join(__dirname, 'taskflow.db'));

// Enable foreign key constraints (Requirement 2.5)
db.pragma('foreign_keys = ON');

module.exports = db;