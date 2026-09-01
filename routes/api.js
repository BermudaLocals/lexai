'use strict';
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db');
const ai = require('../services/ai');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const upload = multer({ storage: multer.memoryStorage(), limits:{ fileSize:20*1024*1024 } });

async function audit(userId, action, resource, resourceId, meta={}){
  try{ await pool.query('INSERT INTO audit_log(user_id,action,resource,resource_id,meta) VALUES($1,$2,$3,$4,$5)',[userId,action,resource,resourceId,JSON.stringify(meta)]);}catch(e){console.error(e.message);}
}
async function getFirm(userId){
  const u = await pool.query('SELECT firm_id FROM users WHERE id=$1',[userId]);
  if(!u.rows[0]?.firm_id) return null;
  const f = await pool.query('SELECT * FROM firms WHERE id=$1',[u.rows[0].firm_id]);
  return f.rows[0]||null;
}
async function consumeCredit(userId, firm){
  if(firm){
    await pool.query('UPDATE firms SET credits=credits-1 WHERE id=$1',[firm.id]);
    if(firm.credits<=0) await pool.query('INSERT INTO overage_log (firm_id,user_id,type,cost) VALUES ($1,$2,$3,0.75)',[firm.id,userId,'doc']);
  } else {
    await pool.query('UPDATE users SET docs_credits=COALESCE(docs_credits,3)-1, docs_used_this_month=COALESCE(docs_used_this_month,0)+1 WHERE id=$1',[userId]);
  }
}
async function checkGate(userId){
  const uRes = await pool.query('SELECT plan, docs_credits, docs_used_this_month, firm_id FROM users WHERE id=$1',[userId]);
  const u = uRes.rows[0]||{docs_credits:3, docs_used_this_month:0};
  let firm=null;
  if(u.firm_id){ const f=await pool.query('SELECT * FROM firms WHERE id=$1',[u.firm_id]); firm=f.rows[0]||null; }
  const freeLeft = 3 - (u.docs_used_this_month||0);
  const available = firm? firm.credits : (u.docs_credits!=null? u.docs_credits : freeLeft);
  return { user:u, firm, available };
}

// FIXED: NOT async
function billable(handler){
  return async (req,res,next)=>{
    try{
      const { firm, available } = await checkGate(req.user.id);
      if(available<=0 &&!firm) return res.status(402).json({error:'free_limit_reached', upgrade:true, message:'Upgrade: $19=20 docs, $49=100, Firm $299/mo'});
      const result = await handler(req,res,firm);
      await consumeCredit(req.user.id, firm);
      return result;
    }catch(e){ console.error('[billable]',e.message); res.status(500).json({error:e.message}); }
  };
}

router.post('/draft', requireAuth, async (req,res)=>{
  try{
    const { type, jurisdiction, details, parties, tone } = req.body;
    if(!type) return res.status(400).json({error:'type required'});
    const { firm, available } = await checkGate(req.user.id);
    if(available<=0 &&!firm) return res.status(402).json({error:'free_limit_reached', message:'3 free used'});
    const content = await ai.draftDocument({ type, jurisdiction, details, parties, tone, userId:req.user.id });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,$2,$3,$4,'draft',$5,$6) RETURNING id`,[req.user.id, `${type}`, type, content, content.split(/\s+/).length, jurisdiction||'General']);
    await consumeCredit(req.user.id, firm);
    res.json({content, doc_id:r.rows[0].id, credits_left: firm? firm.credits-1 : available-1});
  }catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/research', requireAuth, billable(async (req,res)=>{
  const { query, jurisdictions } = req.body;
  if(!query) return res.status(400).json({error:'query required'});
  const content = await ai.researchCaseLaw(req.body);
  const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,$2,'RESEARCH',$3,'complete',$4,$5) RETURNING id`,[req.user.id, `Research: ${query.slice(0,80)}`, content, content.split(/\s+/).length, jurisdictions||'Multiple']);
  res.json({content, doc_id:r.rows[0].id});
}));

router.post('/analyze', requireAuth, billable(async (req,res)=>{
  const { content } = req.body; if(!content) return res.status(400).json({error:'content required'});
  const analysis = await ai.analyzeDocument(req.body);
  res.json({analysis});
}));

router.post('/safeguarding', requireAuth, billable(async (req,res)=>{
  const { facts } = req.body; if(!facts) return res.status(400).json({error:'facts required'});
  const content = await ai.safeguardingSupport(req.body);
  res.json({content});
}));

router.post('/case-summary', requireAuth, billable(async (req,res)=>{
  const { case_facts } = req.body; if(!case_facts) return res.status(400).json({error:'facts required'});
  const content = await ai.buildCaseSummary(req.body);
  res.json({content});
}));

router.post('/chronology', requireAuth, billable(async (req,res)=>{
  const { events } = req.body; if(!events) return res.status(400).json({error:'events required'});
  const content = await ai.buildChronology(req.body);
  res.json({content});
}));

router.post('/horizon', requireAuth, billable(async (req,res)=>{
  const content = await ai.horizonScan(req.body);
  res.json({content});
}));

router.post('/predict', requireAuth, billable(async (req,res)=>{
  const { facts } = req.body; if(!facts) return res.status(400).json({error:'facts required'});
  const prediction = await ai.predictLitigation(req.body);
  res.json({prediction});
}));

router.post('/compare', requireAuth, billable(async (req,res)=>{
  const { topic } = req.body; if(!topic) return res.status(400).json({error:'topic required'});
  const content = await ai.comparativeLaw(req.body);
  res.json({content});
}));

router.post('/transcribe', requireAuth, upload.single('file'), billable(async (req,res)=>{
  if(!req.file) return res.status(400).json({error:'no file'});
  const parsed = await pdfParse(req.file.buffer).catch(()=>({text:req.file.buffer.toString()}));
  res.json({transcript: parsed.text?.slice(0,20000), filename:req.file.originalname});
}));

router.get('/documents', requireAuth, async (req,res)=>{
  const r = await pool.query('SELECT id,title,type,word_count,created_at FROM documents WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',[req.user.id]);
  res.json({documents:r.rows});
});
router.get('/templates', (req,res)=> res.json({templates: ai.TEMPLATES}));
router.get('/jurisdictions', (req,res)=> res.json({jurisdictions: ai.JURISDICTIONS}));
router.get('/status', requireAuth, async (req,res)=>{
  const { firm, available, user } = await checkGate(req.user.id);
  const count = await pool.query('SELECT COUNT(*) FROM documents WHERE user_id=$1',[req.user.id]);
  res.json({status:'active', version:'3.1-harvey', user:{...user, credits_left:available, firm_credits:firm?.credits||null, firm_id:firm?.id||null}, stats:{documents:parseInt(count.rows[0].count)}, firm});
});

module.exports = router;
