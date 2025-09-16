const express = require('express');
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test route
app.post('/test', (req, res) => {
  console.log('Request body:', req.body);
  res.json({ message: 'Received', body: req.body });
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});