const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:4173').split(',').map((o) => o.trim());

// Render terminates TLS at its proxy; trust it so req.secure and req.ip are correct.
// Behind the Netlify /api proxy there is one more hop, so render.yaml sets TRUST_PROXY=2.
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

// Security headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, ...
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// Force HTTPS in production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.secure) return next();
    res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// gzip JSON responses
app.use(compression());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Strip keys starting with $ or containing . from body/query/params to block NoSQL operator injection
app.use(mongoSanitize());

// CSRF defence in depth (alongside SameSite cookies): state-changing requests must come from our own frontend
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || !origin || allowedOrigins.includes(origin)) {
    return next();
  }
  res.status(403).json({ message: 'Cross-site request blocked' });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { message: 'Too many attempts, please try again in 15 minutes' },
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid input' });
  }
  console.error(err);
  // Never leak stack traces or internal messages to the client
  res.status(500).json({ message: 'Something went wrong' });
});

module.exports = app;
