module.exports = {
  requireAuth: (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = req.session.user;
    next();
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
