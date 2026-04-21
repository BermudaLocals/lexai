// LexAI Auth Middleware - pass-through stubs
const passThrough = (req, res, next) => next()

module.exports = {
  ensureAuth: passThrough,
  ensurePaid: passThrough,
  ensurePro: passThrough,
  ensureFirm: passThrough,
  requireAuth: passThrough,
  requirePaid: passThrough,
  requirePro: passThrough,
  requireFirm: passThrough,
  checkDocLimit: passThrough,
}
