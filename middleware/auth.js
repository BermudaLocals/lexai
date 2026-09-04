const jwt = require('jsonwebtoken');
function authenticate(req, res, next) {
  try {
    const token = (req.cookies && req.cookies.token) || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
const requireAuth = authenticate;
module.exports = { authenticate, requireAuth };
module.exports.authenticate = authenticate;
module.exports.requireAuth = authenticate;
