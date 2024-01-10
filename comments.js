// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

// Create express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

const posts = {};

// Get comments for a post
const getComments = (postId) => {
  const comments = posts[postId] || [];
  return comments;
};

// Add comment to post
const addComment = (postId, comment) => {
  const comments = posts[postId] || [];
  comments.push(comment);
  posts[postId] = comments;
};

// Route handler for GET request to /posts/:id/comments
app.get('/posts/:id/comments', (req, res) => {
  const comments = getComments(req.params.id);
  res.status(200).json(comments);
});

// Route handler for POST request to /posts/:id/comments
app.post('/posts/:id/comments', async (req, res) => {
  const { content } = req.body;
  const comment = { id: Math.random().toString(36).substr(2, 9), content };
  addComment(req.params.id, comment);

  // Emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { ...comment, postId: req.params.id },
  });

  res.status(201).json(comment);
});

// Route handler for POST request to /events
app.post('/events', (req, res) => {
  console.log('Received event', req.body.type);
  res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(4001, () => {
  console.log('Listening on 4001');
});