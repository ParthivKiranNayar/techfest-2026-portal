const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Please log in first' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id };
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

module.exports = { requireAuth };
