const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  try {
    const token = (req.cookies && req.cookies.token) || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch(e){ return res.status(401).json({ error: 'Invalid token' }); }
};
module.exports = { authenticate };
module.exports.authenticate = authenticate;
