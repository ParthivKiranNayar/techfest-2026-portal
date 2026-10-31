require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { seedEvents } = require('./seed');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET must be set in production');
    process.exit(1);
  }
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
}

connectDB()
  .then(seedEvents)
  .then(() => {
    app.listen(PORT, () => console.log(`TechFest API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
