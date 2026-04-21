module.exports = {
  ensureAuth: (req, res, next) => next(),  // TODO: add real auth
  ensurePaid: (req, res, next) => next(),
  ensurePro: (req, res, next) => next(),
  ensureFirm: (req, res, next) => next(),
  checkDocLimit: (req, res, next) => next(),
}
