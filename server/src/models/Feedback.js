const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

feedbackSchema.methods.toPublic = function toPublic() {
  return { id: this._id, name: this.name, message: this.message, rating: this.rating, createdAt: this.createdAt };
};

module.exports = mongoose.model('Feedback', feedbackSchema);
