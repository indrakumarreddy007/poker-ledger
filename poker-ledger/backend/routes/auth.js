const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email exists
    const existingEmail = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if username exists
    const existingUsername = await dbAsync.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate avatar URL
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // Create user
    const userId = uuidv4();
    await dbAsync.run(
      'INSERT INTO users (id, email, username, password, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [userId, email, username, hashedPassword, avatarUrl]
    );

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        username,
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await dbAsync.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, avatar_url } = req.body;
    const userId = req.user.id;

    if (username) {
      // Check if username is taken by another user
      const existing = await dbAsync.get(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      await dbAsync.run('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
    }

    if (avatar_url) {
      await dbAsync.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, userId]);
    }

    const updatedUser = await dbAsync.get(
      'SELECT id, email, username, avatar_url FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
