const router = require('express').Router()
const fetch = (...args) => require('node-fetch').then(({default: f}) => f(...args))

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_API = process.env.PAYPAL_ENV === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

// Plan mapping - user will create these in PayPal dashboard
const PLAN_MAP = {
  solo: process.env.PAYPAL_PLAN_SOLO,      // $59/mo
  team: process.env.PAYPAL_PLAN_TEAM,      // $179/mo  
  enterprise: process.env.PAYPAL_PLAN_ENTERPRISE  // $499/mo
}

async function getPayPalToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  return data.access_token
}

// Create subscription checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { plan } = req.body
    const planId = PLAN_MAP[plan]
    
    if (!planId) {
      return res.status(400).json({ error: 'Invalid plan. Choose: solo ($59), team ($179), or enterprise ($499)' })
    }

    const token = await getPayPalToken()
    
    // Create subscription
    const subRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'LexAI.llc',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${process.env.APP_URL || 'https://lexai-production-5f08.up.railway.app'}/login?subscription=success`,
          cancel_url: `${process.env.APP_URL || 'https://lexai-production-5f08.up.railway.app'}/#pricing`
        }
      })
    })
    
    const subData = await subRes.json()
    
    if (subData.links) {
      const approveLink = subData.links.find(l => l.rel === 'approve')
      return res.json({ url: approveLink.href, subscriptionId: subData.id })
    }
    
    res.status(500).json({ error: 'Failed to create subscription' })
  } catch (err) {
    console.error('PayPal checkout error:', err)
    res.status(500).json({ error: 'Checkout failed. Please try again.' })
  }
})

// Webhook for subscription events
router.post('/webhook', async (req, res) => {
  res.status(200).json({ received: true })
  
  const event = req.body
  console.log('PayPal webhook:', event.event_type)
  
  // Handle subscription activated
  if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const subscriptionId = event.resource.id
    const planId = event.resource.plan_id
    const userEmail = event.resource.subscriber?.email_address
    
    console.log(`Subscription activated: ${subscriptionId} for ${userEmail}`)
    // TODO: Update user in database with active subscription
  }
  
  // Handle payment completed
  if (event.event_type === 'PAYMENT.SALE.COMPLETED') {
    console.log('Payment received:', event.resource.amount)
  }
  
  // Handle subscription cancelled
  if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
    console.log('Subscription cancelled:', event.resource.id)
    // TODO: Downgrade user in database
  }
})

// Get subscription status
router.get('/status/:subscriptionId', async (req, res) => {
  try {
    const token = await getPayPalToken()
    const result = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${req.params.subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await result.json()
    res.json({ status: data.status, plan_id: data.plan_id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status' })
  }
})

module.exports = router
