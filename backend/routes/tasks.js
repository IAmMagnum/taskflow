const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. GET /api/board/:boardId - Get board structure with optional Priority Filter (Requirement 2.2 & 2.3)
router.get('/board/:boardId', (req, res) => {
  try {
    const { priority } = req.query;
    const boardId = req.params.boardId;

    // Fetch columns for the board
    const columns = db.prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC').all(boardId);
    
    // Build query for tasks
    let taskQuery = 'SELECT * FROM tasks WHERE column_id IN (SELECT id FROM columns WHERE board_id = ?)';
    const params = [boardId];

    if (priority && priority !== 'All') {
      taskQuery += ' AND priority = ?';
      params.push(priority);
    }
    taskQuery += ' ORDER BY created_at DESC';

    const tasks = db.prepare(taskQuery).all(...params);

    // Group tasks under their respective columns
    const columnsWithTasks = columns.map(col => ({
      ...col,
      tasks: tasks.filter(t => t.column_id === col.id)
    }));

    res.json({ boardId: Number(boardId), columns: columnsWithTasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board data.' });
  }
});

// 2. POST /api/tasks - Create new task with validation (Requirement 2.2 & 2.4)
router.post('/tasks', (req, res) => {
  try {
    const { column_id, title, description, priority } = req.body;

    // Backend Validation: Empty or whitespace-only title rejected
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required and cannot be empty.' });
    }

    if (!column_id) {
      return res.status(400).json({ error: 'column_id is required.' });
    }

    const stmt = db.prepare(
      'INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(column_id, title.trim(), description || '', priority || 'Medium');

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// 3. PUT /api/tasks/:id - Update or move task (Requirement 2.2 & 2.4)
router.put('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, column_id } = req.body;

    // Validation check on edit
    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty.' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existingTask.title;
    const updatedDesc = description !== undefined ? description : existingTask.description;
    const updatedPriority = priority || existingTask.priority;
    const updatedColumnId = column_id || existingTask.column_id;

    db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, priority = ?, column_id = ?
      WHERE id = ?
    `).run(updatedTitle, updatedDesc, updatedPriority, updatedColumnId, id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// 4. DELETE /api/tasks/:id - Delete a task (Requirement 2.2)
router.delete('/tasks/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// 5. Special Query Endpoints (Requirement 2.5 - Non-trivial custom queries)
// Query A: Count of tasks per column on a board
router.get('/stats/column-counts/:boardId', (req, res) => {
  const query = `
    SELECT c.id AS column_id, c.title AS column_title, COUNT(t.id) AS task_count
    FROM columns c
    LEFT JOIN tasks t ON c.id = t.column_id
    WHERE c.board_id = ?
    GROUP BY c.id, c.title
    ORDER BY c.position ASC;
  `;
  const stats = db.prepare(query).all(req.params.boardId);
  res.json(stats);
});

// GET /api/boards - Fetch list of all boards
router.get('/boards', (req, res) => {
  try {
    const boards = db.prepare('SELECT * FROM boards ORDER BY id ASC').all();
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boards.' });
  }
});

// POST /api/boards - Create a new board with default columns
router.post('/boards', (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Board title is required.' });
    }

    // Insert new board
    const boardStmt = db.prepare('INSERT INTO boards (title) VALUES (?)');
    const result = boardStmt.run(title.trim());
    const newBoardId = result.lastInsertRowid;

    // Create default columns for the new board
    const insertColumn = db.prepare('INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)');
    insertColumn.run(newBoardId, 'To Do', 1);
    insertColumn.run(newBoardId, 'In Progress', 2);
    insertColumn.run(newBoardId, 'Done', 3);

    const newBoard = db.prepare('SELECT * FROM boards WHERE id = ?').get(newBoardId);
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board.' });
  }
});



module.exports = router;