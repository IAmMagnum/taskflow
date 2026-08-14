const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Mount API routes
app.use('/api', taskRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send({ status: 'TaskFlow Backend Running' });
});

module.exports = app;