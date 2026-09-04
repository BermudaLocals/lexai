const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  try {
    const raw = (req.cookies && req.cookies.token) || (req.headers.authorization || '').replace('Bearer ', '');
    if (!raw) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(raw, process.env.JWT_SECRET);
    const owner_id = payload.owner_id || payload.id;
    if (!owner_id) return res.status(401).json({ error: 'Invalid token payload' });
    req.user = { owner_id: owner_id, email: payload.email, id: owner_id };
    next();
  } catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
};
const requireAuth = authenticate;
module.exports = { authenticate, requireAuth };
module.exports.authenticate = authenticate;
module.exports.requireAuth = authenticate;
module.exports.default = authenticate;
