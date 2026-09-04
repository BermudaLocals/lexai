import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../config/db.js';
const router = express.Router();
router.get('/', authenticate, async (req,res)=>{
  const ownerId = req.user.owner_id;
  const [rows] = await db.query('SELECT owner_id,email,firm_credits,seats,plan FROM users WHERE owner_id=? LIMIT 1',[ownerId]);
  if(!rows[0]) return res.status(404).json({error:'not found'});
  res.json({ owner_id: rows[0].owner_id, email: rows[0].email, firm_credits: rows[0].firm_credits??0, seats: rows[0].seats, plan: rows[0].plan });
});
export default router;
