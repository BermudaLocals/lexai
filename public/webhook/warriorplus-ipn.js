// WarriorPlus IPN - Node.js - Offer 94697 - lexai.llc/webhook/warriorplus-ipn.js
const express = require('express');
const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const DOCS_MAP = { '473669': 10, '473682': 40, '473683': 120 };
const PROFIT_MAP = { '473669': 9.48, '473682': 17.15, '473683': 52.05 };
const API_COST = 1.33;

app.post('/webhook/warriorplus-ipn', (req,res)=>{
  const {txn_id, product_id, customer_email, buyer_email, customer_name, amount} = req.body;
  const email = customer_email || buyer_email;
  const docs = DOCS_MAP[product_id] || 0;
  const apiCost = docs * API_COST;
  const profit = PROFIT_MAP[product_id] || 0;
  console.log(`[${new Date().toISOString()}] ${txn_id} - ${product_id} - ${email} - ${docs} docs - API $${apiCost} - Profit $${profit}`);
  // TODO: createLexAIUser(email, docs, product_id)
  const plan = product_id==='473669'?'basic':product_id==='473682'?'solo':'larger';
  const loginUrl = `https://lexai.llc/business?offer=94697&plan=${plan}&email=${encodeURIComponent(email)}&txn=${txn_id}`;
  // TODO: send email with loginUrl
  res.status(200).send(`OK - ${docs} docs for ${email} - Profit $${profit} - ${loginUrl}`);
});

app.listen(3000, ()=>console.log('LexAI IPN listening on 3000 - Offer 94697'));
