const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const ids = require('./proxy/src/middleware')

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow React client
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(ids)

// Connect to MongoDB
mongoose.connect('mongodb://mongo:wYPsOdKTOKbnFmXdbLrLOasEqBUNdoyL@junction.proxy.rlwy.net:12139', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Define Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  photo: String,
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Blog = mongoose.model('Blog', blogSchema);

// Authentication Middleware

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err)
      return res.status(403).json({ message: 'Invalid Token' })
    };
    req.user = user;
    next();
  });
};

// Signup Route
app.post('/api/signup', [
  body('username').isLength({ min: 5 }),
  body('password').isLength({ min: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add Blog Route
app.post('/api/blogs', authenticateToken, async (req, res) => {
  const { title, content, photo } = req.body;
  try {
    const blog = new Blog({
      title,
      content,
      photo,
      author: req.user.username,
      user: req.user.id,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to add blog' });
  }
});

// Get Blogs Route
app.get('/api/blogs', authenticateToken, async (req, res) => {
  try {
    const blogs = await Blog.find().populate('user', 'username');
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Use history API fallback
app.use(history());

// Serve index.html on all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(8000, () => {
  console.log('Server is running on port 5000');
});
