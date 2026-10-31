const express = require('express');
const Event = require('../models/Event');
const { requireAuth } = require('../middleware/auth');
const { eventIdRules } = require('../middleware/validate');

const router = express.Router();

function toPublic(event, userId) {
  return {
    id: event._id,
    title: event.title,
    category: event.category,
    description: event.description,
    date: event.date,
    venue: event.venue,
    capacity: event.capacity,
    fee: event.fee,
    registered: event.participants.length,
    joined: userId ? event.participants.some((p) => p.equals(userId)) : false,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events.map((e) => toPublic(e)));
  } catch (err) {
    next(err);
  }
});

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const events = await Event.find({ participants: req.user.id }).sort({ date: 1 });
    res.json(events.map((e) => toPublic(e, req.user.id)));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/register', requireAuth, eventIdRules, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.participants.some((p) => p.equals(req.user.id))) {
      return res.status(409).json({ message: 'You are already registered for this event' });
    }
    if (event.participants.length >= event.capacity) {
      return res.status(409).json({ message: 'This event is full' });
    }
    event.participants.push(req.user.id);
    await event.save();
    res.status(201).json(toPublic(event, req.user.id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
