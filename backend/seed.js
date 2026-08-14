const db = require('./db');

function seedDatabase() {
  console.log('Seeding database...');

  // 1. Create Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
    );
  `);

  // Clear old data for fresh seed
  db.exec('DELETE FROM tasks;');
  db.exec('DELETE FROM columns;');
  db.exec('DELETE FROM boards;');

  // 2. Insert Initial Seed Data
  const insertBoard = db.prepare('INSERT INTO boards (id, title) VALUES (1, ?)');
  insertBoard.run('Main Board');

  const insertColumn = db.prepare('INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)');
  const col1 = insertColumn.run(1, 'To Do', 1).lastInsertRowid;
  const col2 = insertColumn.run(1, 'In Progress', 2).lastInsertRowid;
  const col3 = insertColumn.run(1, 'Done', 3).lastInsertRowid;

  const insertTask = db.prepare('INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)');
  insertTask.run(col1, 'Setup project repository', 'Initialize frontend and backend repos', 'High');
  insertTask.run(col1, 'Design DB Schema', 'Write SQL file and seed scripts', 'High');
  insertTask.run(col2, 'Implement Express API', 'Build REST endpoints with validation', 'Medium');
  insertTask.run(col3, 'Read Project Requirements', 'Review take-home instructions', 'Low');

  console.log('Database seeded successfully!');
}

seedDatabase();