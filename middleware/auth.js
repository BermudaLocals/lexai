module.exports = {
  requireAuth: (req, res, next) => {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || process.env.SESSION_SECRET || 'lexai-dev-change-in-prod');
        req.user = decoded;
        return next();
      } catch(e) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    return res.status(401).json({ error: 'Unauthorized' });
  },
  requirePaid: (req, res, next) => {
    if (!req.user || !['paid','pro','firm'].includes(req.user.plan)) {
      return res.status(403).json({ error: 'Paid plan required' });
    }
    next();
  },
  requirePro: (req, res, next) => {
    if (!req.user || !['pro','firm'].includes(req.user.plan)) {
      return res.status(403).json({ error: 'Pro plan required' });
    }
    next();
  },
  requireFirm: (req, res, next) => {
    if (!req.user || req.user.plan !== 'firm') {
      return res.status(403).json({ error: 'Firm plan required' });
    }
    next();
  },
  checkDocLimit: (req, res, next) => next(),
};
