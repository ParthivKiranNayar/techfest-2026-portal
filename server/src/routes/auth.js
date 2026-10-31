const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validate');

const router = express.Router();

function cookieOptions() {
  return {
    httpOnly: true, // not readable from document.cookie, so XSS cannot steal the session
    secure: process.env.NODE_ENV === 'production', // only sent over HTTPS
    sameSite: process.env.COOKIE_SAMESITE || 'strict', // not sent on requests started by other sites (CSRF)
    path: '/',
  };
}

function sendToken(res, user, status = 200) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.cookie('token', token, { ...cookieOptions(), maxAge: 2 * 60 * 60 * 1000 });
  res.status(status).json({ user: user.toPublic() });
}

router.post('/register', registerRules, async (req, res, next) => {
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

router.post('/login', loginRules, async (req, res, next) => {
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
  res.clearCookie('token', cookieOptions());
  res.json({ message: 'Logged out' });
});

// Used by the client on page load: answers 200 with user: null when logged out, so it doesn't log a 401
router.get('/session', async (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.json({ user: null });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    res.json({ user: user ? user.toPublic() : null });
  } catch {
    res.json({ user: null });
  }
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
