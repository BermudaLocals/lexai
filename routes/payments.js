const express = require('express');
const router = express.Router();

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PLAN_MAP = {
  'solo':                 process.env.PAYPAL_PLAN_SOLO     || process.env.PAYPAL_PLAN_STARTER,
  'firm':                 process.env.PAYPAL_PLAN_FIRM     || process.env.PAYPAL_PLAN_PRO,
  'enterprise':           process.env.PAYPAL_PLAN_ENT      || process.env.PAYPAL_PLAN_ELITE,
  'academy-corporate':    process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-criminal':     process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-international':process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-property':     process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-family':       process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-ip':           process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-tax':          process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-caribbean':    process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'academy-bar':          process.env.PAYPAL_PLAN_ACADEMY  || process.env.PAYPAL_PLAN_PRO,
  'starter':              process.env.PAYPAL_PLAN_STARTER,
  'pro':                  process.env.PAYPAL_PLAN_PRO,
  'elite':                process.env.PAYPAL_PLAN_ELITE,
};

async function getToken() {
  const creds = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const r = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('PayPal auth failed');
  return d.access_token;
}

router.get('/plans', (req, res) => res.json({ plans: PLAN_MAP }));

router.post('/checkout', async (req, res) => {
  try {
    const { plan } = req.body;
    const planId = PLAN_MAP[plan];
    const appUrl = process.env.APP_URL || 'https://lexai.llc';

    if (!planId || planId === 'REPLACE' || !process.env.PAYPAL_SECRET || process.env.PAYPAL_SECRET === 'REPLACE_WITH_SECRET_KEY') {
      return res.json({ url: `${appUrl}/login?next=pricing&plan=${plan}&msg=coming_soon` });
    }

    const token = await getToken();
    const r = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'LexAI',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${appUrl}/api/payments/success?plan=${plan}`,
          cancel_url: `${appUrl}/#pricing`,
        },
      }),
    });

    const data = await r.json();
    const link = data.links?.find(l => l.rel === 'approve');
    if (!link) throw new Error(JSON.stringify(data));
    res.json({ url: link.href });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/subscribe', async (req, res) => {
  req.body.plan = req.body.plan || 'pro';
  return router.handle(Object.assign(req, { url: '/checkout', method: 'POST' }), res, () => {});
});

router.get('/success', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Welcome to LexAI</title>
<style>body{background:#070709;color:#ece9e0;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.b{text-align:center;max-width:500px;padding:40px;}h1{color:#d4af37;font-size:2rem;margin-bottom:16px;}
p{color:#7a766c;line-height:1.6;margin-bottom:24px;}a{display:inline-block;background:#d4af37;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;}</style>
</head><body><div class="b"><h1>⚖️ Welcome to LexAI</h1>
<p>Your subscription is now active. You have full access to the world's most advanced AI legal platform.</p>
<a href="/">Enter LexAI →</a></div></body></html>`);
});

// NEW PAYPAL PAYMENT ENDPOINTS for nvme.live
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'USD', product_id, product_name } = req.body;
    const token = await getToken();
    const order = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
          breakdown: {
            item_total: { currency_code: currency, value: amount.toString() },
            shipping: { currency_code: currency, value: '0.00' },
            tax_total: { currency_code: currency, value: '0.00' }
          }
        },
        items: [{
          name: product_name || 'Product',
          description: `Product ID: ${product_id}`,
          quantity: '1',
          unit_amount: { currency_code: currency, value: amount.toString() }
        }],
        reference_id: product_id || 'default'
      }],
      application_context: {
        brand_name: 'nvme.live',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.APP_URL || 'https://nvme.live'}/api/payments/capture-order?order_id=${product_id}&success=true`,
        cancel_url: `${process.env.APP_URL || 'https://nvme.live'}/pricing`
      }
    };
    const r = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await r.json();
    if (!data.id) throw new Error('Failed to create PayPal order');
    res.json({ order_id: data.id, links: data.links });
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/capture-order', async (req, res) => {
  try {
    const { order_id, payer_id } = req.body;
    const token = await getToken();
    const capture = { payer_id };
    const r = await fetch(`${PAYPAL_API}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(capture)
    });
    const data = await r.json();
    if (data.status !== 'COMPLETED') throw new Error(`Payment not completed: ${data.status}`);
    res.json({
      success: true,
      order_id: data.id,
      capture_id: data.purchase_units[0].payments.captures[0].id,
      amount: data.purchase_units[0].amount.value,
      currency: data.purchase_units[0].amount.currency_code,
      status: data.status,
      payer_email: data.payer.email_address,
      payment_time: data.create_time
    });
  } catch (err) {
    console.error('Capture order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Configuration for case law search API
const CASELAW_PROVIDERS = {
  westlaw: {
    baseURL: process.env.CASELAW_WESTLAW_URL || 'https://api.westlaw.com/v1',
    apiKey: process.env.CASELAW_WESTLAW_KEY || 'REPLACE_WITH_WESTLAW_KEY',
    enabled: true
  },
  casetext: {
    baseURL: process.env.CASELAW_CATEXT_URL || 'https://api.casetext.com/v1',
    apiKey: process.env.CASELAW_CATEXT_KEY || 'REPLACE_WITH_CATEXT_KEY',
    enabled: true
  },
  google_scholar: {
    baseURL: 'https://scholar.google.com',
    enabled: false // requires scraping automation
  },
  noten: {
    baseURL: process.env.CASELAW_NOTEN_URL || 'https://api.noten.io/v1',
    apiKey: process.env.CASELAW_NOTEN_KEY || 'REPLACE_WITH_NOTEN_KEY',
    enabled: false
  }
};

// Async function to search case law across multiple providers
async function searchCaseLaw(query, jurisdiction, options = {}) {
  const results = {
    query,
    jurisdiction,
    timestamp: new Date().toISOString(),
    providers: {},
    combined: [],
    total_cases: 0,
    error: null
  };

  const providers = Object.entries(CASELAW_PROVIDERS).filter(([_, config]) => config.enabled);
  if (providers.length === 0) {
    results.error = 'No case law providers configured. Please configure at least one provider.';
    return results;
  }

  for (const [providerName, config] of providers) {
    try {
      let providerResults = [];

      switch (providerName) {
        case 'westlaw':
          providerResults = await searchWestlaw(query, jurisdiction, config, options);
          break;
        case 'casetext':
          providerResults = await searchCasetext(query, jurisdiction, config, options);
          break;
        default:
          providerResults = [];
          results.providers[providerName] = {
            success: false,
            error: 'Provider not implemented'
          };
          continue;
      }

      results.providers[providerName] = {
        success: true,
        results_count: providerResults.length,
        results: providerResults.slice(0, 5) // Limit to top 5 results per provider
      };

      // Deduplicate and combine results
      const uniqueResults = providerResults.filter(
        (result, index, self) =>
          index === self.findIndex(r => r.id === result.id || r.url === result.url)
      );

      results.combined.push(...uniqueResults);
    } catch (err) {
      results.providers[providerName] = {
        success: false,
        error: err.message || 'Provider error'
      };
    }
  }

  // Sort combined results by relevance (simple scoring)
  results.combined.sort((a, b) => {
    const scoreA = (a.relevance_score || 0) + (a.citation_count || 0);
    const scoreB = (b.relevance_score || 0) + (b.citation_count || 0);
    return scoreB - scoreA;
  });

  results.total_cases = results.combined.length;
  return results;
}

async function searchWestlaw(query, jurisdiction, config, options) {
  const url = `${config.baseURL}/cases`;
  const params = new URLSearchParams({
    q: query,
    jurisdiction: jurisdiction.toLowerCase(),
    ...(options.limit ? { limit: options.limit } : { limit: 20 }),
    ...(options.dateRange ? { date_range: options.dateRange } : {}),
    sort: 'relevance'
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error(`Westlaw API error: ${response.status}`);

  const data = await response.json();
  return data.cases?.map(caseData => ({
    id: caseData.id || `westlaw_${Math.random()}`,
    name: caseData.name || caseData.name || 'Unknown Case',
    citation: caseData.citation || caseData.citation || '',
    date: caseData.date || caseData.date || '',
    court: caseData.court || caseData.court || '',
    jurisdiction: caseData.jurisdiction || jurisdiction,
    url: caseData.url || caseData.url || '#',
    snippet: caseData.snippet || caseData.snippet || '',
    relevance_score: caseData.relevance_score || 0,
    citation_count: caseData.citation_count || 0,
    quotes: caseData.quotes || [],
    judge: caseData.judge || '',
    parties: caseData.parties || ''
  })) || [];
}

async function searchCasetext(query, jurisdiction, config, options) {
  const url = `${config.baseURL}/cases/search`;
  const body = {
    query,
    jurisdiction: jurisdiction.toLowerCase(),
    limit: options.limit || 20,
    ...(options.dateRange ? { date_range: options.dateRange } : {}),
    include_full_text: options.include_full_text || false,
    sort_by: 'relevance'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Casetext API error: ${response.status}`);

  const data = await response.json();
  return data.cases?.map(caseData => ({
    id: caseData.id || `casetext_${Math.random()}`,
    name: caseData.name || caseData.name || 'Unknown Case',
    citation: caseData.citation || caseData.citation || '',
    date: caseData.date || caseData.date || '',
    court: caseData.court || caseData.court || '',
    jurisdiction: caseData.jurisdiction || jurisdiction,
    url: caseData.url || caseData.url || '#',
    snippet: caseData.snippet || caseData.snippet || '',
    relevance_score: caseData.relevance_score || 0,
    citation_count: caseData.citation_count || 0,
    quotes: caseData.quotes || [],
    judge: caseData.judge || '',
    parties: caseData.parties || ''
  })) || [];
}

// Export enhanced case law search function
module.exports = {
  ...module.exports,
  CASELAW_PROVIDERS,
  searchCaseLaw,
  searchWestlaw,
  searchCasetext
};

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    console.log('PayPal webhook:', event.event_type, event.resource?.id);
    res.json({ received: true });
  } catch (e) { res.status(400).send('error'); }
});

module.exports = router;
