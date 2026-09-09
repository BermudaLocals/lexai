// middleware/language.js - Central language middleware for complete site
// Both sides pull from config/locales.js - lexai.llc/business AND lexai.llc/legal
// Handles EN, ES, PT, FR, JA, ZH, KO - Asia included
// Drop into BermudaLocals/lexai as middleware/language.js

const { getLangFromReq, locales } = require('../config/locales');

function languageMiddleware(req, res, next) {
  const lang = getLangFromReq(req);
  req.lang = lang;
  req.t = (path) => {
    const keys = path.split('.');
    let cur = locales[lang];
    for (const k of keys) {
      if (cur && cur[k] !== undefined) cur = cur[k];
      else {
        // fallback to EN
        cur = locales.EN;
        for (const k2 of keys) cur = cur?.[k2];
        break;
      }
    }
    return cur;
  };
  req.locales = locales;
  req.allLangs = Object.keys(locales);
  
  // Set cookie for persistence
  res.cookie('lexai_lang', lang, { 
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    httpOnly: false, 
    sameSite: 'Lax',
    path: '/'
  });
  
  // Set header for frontend
  res.setHeader('X-Lang', lang);
  res.setHeader('Content-Language', lang.toLowerCase());
  
  next();
}

// Helper for frontend - inject lang into HTML
function injectLangScript(lang) {
  return `<script>window.__LEXAI_LANG__="${lang}";localStorage.setItem('lexai_lang','${lang}');</script>`;
}

module.exports = { languageMiddleware, injectLangScript };
