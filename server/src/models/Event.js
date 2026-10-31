const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Technical', 'Workshop', 'Cultural', 'Gaming'], required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    fee: { type: Number, default: 0, min: 0 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
