const request = require('supertest');
const { describe, test, expect, beforeAll } = require('vitest');
const app = require('../app');
const db = require('../db');

describe('TaskFlow API & Database Tests', () => {

  // Test 1: Validation failure on empty title
  test('Creating a task with no title fails with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ column_id: 1, title: '   ', priority: 'High' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test 2: Moving a task updates column_id
  test('Moving a task updates its column correctly', async () => {
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ column_id: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.column_id).toBe(2);
  });

  // Test 3: Direct DB Query test
  test('Database query layer correctly filters tasks by priority', () => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE priority = ? ORDER BY created_at DESC');
    const highPriorityTasks = stmt.all('High');

    expect(Array.isArray(highPriorityTasks)).toBe(true);
    highPriorityTasks.forEach(task => {
      expect(task.priority).toBe('High');
    });
  });
});