const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  // Dev convenience: allow bypassing auth when the frontend demo has no login yet.
  // Enable by setting DISABLE_AUTH=true (for local development only).
  if (String(process.env.DISABLE_AUTH).toLowerCase() === 'true') {
    req.user = {
      userId: process.env.DEV_USER_ID || 'USR001',
      role: process.env.DEV_USER_ROLE || 'admin',
      branchId: process.env.DEV_USER_BRANCH_ID || 'BR001'
    };
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization Bearer token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role, branchId? }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
