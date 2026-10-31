const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function sendToken(res, user, status = 200) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.cookie('token', token);
  res.status(status).json({ user: user.toPublic() });
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, college } = req.body;
    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password, college });
    sendToken(res, user, 201);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    sendToken(res, user);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Account not found' });
    res.json({ user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
