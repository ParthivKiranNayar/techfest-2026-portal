const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Feedback.find().sort({ createdAt: -1 }).limit(20);
    res.json(items.map((f) => f.toPublic()));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Account not found' });
    const { message, rating } = req.body;
    const feedback = await Feedback.create({ user: user._id, name: user.name, message, rating });
    res.status(201).json(feedback.toPublic());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
