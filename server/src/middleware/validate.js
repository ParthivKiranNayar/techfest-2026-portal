const { body, param, validationResult } = require('express-validator');

// Runs after the rule chains and rejects the request with every message that failed
function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  res.status(400).json({
    message: 'Please fix the highlighted fields',
    errors: result.array().map((e) => ({ field: e.path, msg: e.msg })),
  });
}

// isString() rejects objects like { "$ne": null } even before sanitising
const email = body('email')
  .isString()
  .withMessage('Email is required')
  .bail()
  .trim()
  .isEmail()
  .withMessage('Enter a valid email')
  .normalizeEmail({ gmail_remove_dots: false });

const registerRules = [
  body('name')
    .isString()
    .withMessage('Name is required')
    .bail()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be 2-60 characters'),
  email,
  body('password')
    .isString()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be 8-72 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('college').optional().isString().trim().isLength({ max: 100 }).withMessage('College name is too long'),
  handleValidation,
];

const loginRules = [
  email,
  body('password').isString().withMessage('Password is required').bail().notEmpty().withMessage('Password is required'),
  handleValidation,
];

const feedbackRules = [
  body('message')
    .isString()
    .withMessage('Message is required')
    .bail()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Feedback must be 3-500 characters'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1 to 5').toInt(),
  handleValidation,
];

const eventIdRules = [param('id').isMongoId().withMessage('Invalid event id'), handleValidation];

module.exports = { registerRules, loginRules, feedbackRules, eventIdRules };
