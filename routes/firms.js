router.post('/firms/create', auth, async (req,res) => {
  const { name, seats=5 } = req.body;
  // Enforce 5-seat min like Harvey 20-seat min
  if (seats < 5) return res.status(400).json({error:'Firm min 5 seats'});
  const firm = await db.query(
    'INSERT INTO firms (name, owner_id, seats, credits, plan) VALUES ($1,$2,$3,500,$4) RETURNING *',
    [name, req.user.id, seats, seats >=20? 'enterprise' : 'firm']
  );
  await db.query('UPDATE users SET firm_id=$1 WHERE id=$2', [firm.rows[0].id, req.user.id]);
  res.json(firm.rows[0]);
});

// Business portal upgrade — list all Bermuda firms to sell to
router.get('/business-portal/leads', auth, async (req,res) => {
  const leads = await db.query(`SELECT * FROM firms WHERE plan='firm'`);
  res.json(leads.rows);
});

// Vault storage billing — pure profit
router.post('/vault/upload', auth, async (req,res) => {
  const fileSizeGb = req.file.size / 1e9;
  const user = await db.query('SELECT storage_used_gb, firm_id FROM users WHERE id=$1', [req.user.id]);
  if (user.rows[0].storage_used_gb + fileSizeGb > 10) {
    // charge $99 per 10GB — costs you $0.20
    await db.query('INSERT INTO overage_log (firm_id, type, cost) VALUES ($1,$2,99)', [user.rows[0].firm_id, 'storage']);
  }
  //... upload logic
});
