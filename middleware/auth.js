import jwt from 'jsonwebtoken';
export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch(e){ return res.status(401).json({ error: 'Invalid token' }); }
};
export default authenticate;
