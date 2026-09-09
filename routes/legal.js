// routes/business.js - UPDATED TO PULL FROM CENTRAL config/locales.js
// BOTH SIDES USE SAME LANGUAGE FILE - business and legal
// Pricing: BASIC $49 / SOLO SMB $150 / LARGER COMPANY $450 - No trials
// Languages: EN, ES, PT, FR, JA, ZH, KO - Asia included
// Drop into BermudaLocals/lexai as routes/business.js - replaces old file

const express = require('express');
const router = express.Router();
const { locales, getLangFromReq } = require('../config/locales');

router.get('/', (req, res) => {
  const lang = getLangFromReq(req);
  const L = locales[lang] || locales.EN;
  const email = req.query.email || '';
  const name = req.query.name || '';
  const saleId = req.query.sale || '';

  const plans = [L.legal.plans.basic, L.legal.plans.solo, L.legal.plans.larger];

  const langSwitcher = `
    <div style="position:absolute;top:16px;right:16px;z-index:20;display:flex;flex-wrap:wrap;gap:6px;font-family:Geist Mono,monospace;font-size:10px;max-width:320px;justify-content:flex-end">
      ${Object.keys(locales).map(l => {
        const loc = locales[l];
        return `<a href="?lang=${l}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&sale=${encodeURIComponent(saleId)}" 
          style="padding:6px 10px;border-radius:999px;border:1px solid ${lang===l?'#FFD60A':'rgba(255,255,255,0.15)'};background:${lang===l?'#FFD60A':'#0A0A0A'};color:${lang===l?'#000':'#777'};text-decoration:none;font-weight:${lang===l?'700':'400'}">
          ${loc.flag} ${l}
        </a>`;
      }).join('')}
    </div>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.cookie('lexai_lang', lang, { maxAge: 2592000, httpOnly: false, sameSite: 'Lax', path: '/' });

  const html = `<!DOCTYPE html>
<html lang="${lang.toLowerCase()}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LexAI Business - $49 / $150 / $450 - ${L.common.business}</title>
<meta name="description" content="${L.legal.desc}">
<style>
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700;800&family=Geist+Mono:wght@400;500&display=swap');
*{font-family:Geist,system-ui,sans-serif;box-sizing:border-box} .mono{font-family:"Geist Mono",monospace !important}
body{margin:0;background:#000;color:#fff;-webkit-font-smoothing:antialiased}
a{color:inherit}
</style>
</head>
<body>
<div style="max-width:1200px;margin:0 auto;padding:80px 20px 40px;position:relative">
${langSwitcher}

<div class="mono" style="font-size:11px;letter-spacing:0.18em;color:#666;margin-bottom:14px">${L.legal.overline}</div>
<h1 style="font-size:44px;line-height:0.95;letter-spacing:-0.04em;margin:0 0 12px;font-weight:800">${L.legal.title} <span style="color:#666;font-weight:400">${L.legal.sub}</span></h1>
<p style="color:#888;max-width:660px;font-size:14px;line-height:1.6;margin:16px 0 0">${L.legal.desc}</p>
<div class="mono" style="font-size:10px;color:#FFD60A;margin-top:16px;border:1px solid rgba(255,214,10,0.25);display:inline-flex;gap:8px;align-items:center;padding:7px 14px;border-radius:999px;background:rgba(255,214,10,0.06)">
<span>●</span> ${L.common.noTrials}
</div>

<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px">
<!-- BASIC $49 -->
<div style="background:#0A0A0A;border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:28px;display:flex;flex-direction:column">
<div class="mono" style="font-size:10px;color:#555;letter-spacing:0.2em">${L.legal.plans.basic.code}</div>
<div style="display:flex;justify-content:space-between;margin-top:10px;align-items:start"><h3 style="margin:0;font-size:15px;font-weight:700">${L.legal.plans.basic.name}</h3><span class="mono" style="font-size:9px;background:#FFD60A;color:#000;padding:5px 10px;border-radius:999px;font-weight:700">${L.legal.plans.basic.badge}</span></div>
<div style="margin-top:24px"><span style="font-size:34px;font-weight:800;letter-spacing:-0.03em">$${L.legal.plans.basic.price}</span><span class="mono" style="font-size:12px;color:#555;margin-left:6px">${L.legal.plans.basic.per}</span></div>
<div class="mono" style="font-size:11px;color:#666;margin-top:8px">${L.legal.plans.basic.pdesc}</div>
<div style="margin-top:22px;display:flex;flex-direction:column;gap:11px">
${L.legal.plans.basic.features.map(f=>`<div style="display:flex;gap:12px"><span class="mono" style="font-size:10px;color:#555;min-width:58px;padding-top:2px">${f.split(' - ')[0].split(' ')[0]}</span><span style="font-size:13px;color:#D0D0D0;line-height:1.4">${f}</span></div>`).join('')}
</div>
<div style="margin-top:auto;padding-top:30px"><button style="width:100%;height:46px;border-radius:12px;background:#111;color:#fff;border:1px solid rgba(255,255,255,0.12);font-weight:700;font-size:13px;cursor:pointer" onclick="location.href='/checkout?plan=basic&lang=${lang}&email=${encodeURIComponent(email)}&sale=${encodeURIComponent(saleId)}'">${L.legal.plans.basic.cta}</button><div class="mono" style="font-size:9px;color:#444;text-align:center;margin-top:12px;letter-spacing:0.04em">${L.legal.plans.basic.foot}</div></div>
</div>

<!-- SOLO $150 -->
<div style="background:#111;border:1px solid rgba(255,255,255,0.12);border-radius:22px;padding:28px;display:flex;flex-direction:column">
<div class="mono" style="font-size:10px;color:#555;letter-spacing:0.2em">${L.legal.plans.solo.code}</div>
<div style="display:flex;justify-content:space-between;margin-top:10px"><h3 style="margin:0;font-size:15px;font-weight:700">${L.legal.plans.solo.name}</h3><span class="mono" style="font-size:10px;background:#222;color:#888;padding:5px 10px;border-radius:999px">${L.legal.plans.solo.badge}</span></div>
<div style="margin-top:24px"><span style="font-size:34px;font-weight:800;letter-spacing:-0.03em">$${L.legal.plans.solo.price}</span><span class="mono" style="font-size:12px;color:#555;margin-left:6px">${L.legal.plans.solo.per}</span></div>
<div class="mono" style="font-size:11px;color:#666;margin-top:8px">${L.legal.plans.solo.pdesc}</div>
<div style="margin-top:22px;display:flex;flex-direction:column;gap:11px">
${L.legal.plans.solo.features.map(f=>`<div style="display:flex;gap:12px"><span class="mono" style="font-size:10px;color:#555;min-width:58px;padding-top:2px">${f.split(' - ')[0].split(' ')[0]}</span><span style="font-size:13px;color:#D0D0D0;line-height:1.4">${f}</span></div>`).join('')}
</div>
<div style="margin-top:auto;padding-top:30px"><button style="width:100%;height:46px;border-radius:12px;background:#fff;color:#000;border:0;font-weight:700;font-size:13px;cursor:pointer" onclick="location.href='/checkout?plan=solo&lang=${lang}&email=${encodeURIComponent(email)}&sale=${encodeURIComponent(saleId)}'">${L.legal.plans.solo.cta}</button><div class="mono" style="font-size:9px;color:#555;text-align:center;margin-top:12px">${L.legal.plans.solo.foot}</div></div>
</div>

<!-- LARGER $450 -->
<div style="background:#fff;color:#000;border-radius:22px;padding:28px;display:flex;flex-direction:column;position:relative;box-shadow:0 0 0 1px #FFD60A inset,0 24px 80px rgba(255,214,10,0.18)">
<div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:#FFD60A;color:#000;border-radius:999px;padding:5px 14px;font-size:10px;display:flex;align-items:center;gap:6px;border:1px solid rgba(0,0,0,0.08)" class="mono"><span style="width:18px;height:18px;background:#000;color:#FFD60A;border-radius:999px;display:grid;place-items:center;font-size:10px">★</span> ${L.legal.plans.larger.badge}</div>
<div style="display:flex;justify-content:space-between;margin-top:14px"><div><div class="mono" style="font-size:10px;color:rgba(0,0,0,0.4);letter-spacing:0.18em">${L.legal.plans.larger.code}</div><h3 style="margin:6px 0 0;font-size:15px;font-weight:700;letter-spacing:-0.01em">${L.legal.plans.larger.name}</h3></div><span class="mono" style="font-size:10px;background:#000;color:#fff;padding:5px 10px;border-radius:999px;height:fit-content">${L.legal.plans.larger.users}</span></div>
<div style="margin-top:24px"><span style="font-size:38px;font-weight:800;letter-spacing:-0.04em">$${L.legal.plans.larger.price}</span><span class="mono" style="font-size:12px;color:rgba(0,0,0,0.5);margin-left:6px">${L.legal.plans.larger.per}</span></div>
<div class="mono" style="font-size:11px;color:rgba(0,0,0,0.6);margin-top:8px">${L.legal.plans.larger.pdesc}</div>
<div style="margin-top:22px;display:flex;flex-direction:column;gap:11px">
${L.legal.plans.larger.features.map(f=>`<div style="display:flex;gap:12px"><span class="mono" style="font-size:10px;color:rgba(0,0,0,0.4);min-width:52px;padding-top:2px">${f.split(' ')[0]}</span><span style="font-size:13px;color:rgba(0,0,0,0.8);font-weight:500;line-height:1.4">${f}</span></div>`).join('')}
</div>
<div style="margin-top:auto;padding-top:30px"><button style="width:100%;height:46px;border-radius:12px;background:#000;color:#fff;border:0;font-weight:700;font-size:13px;cursor:pointer" onclick="location.href='/checkout?plan=larger&lang=${lang}&email=${encodeURIComponent(email)}&sale=${encodeURIComponent(saleId)}'">${L.legal.plans.larger.cta}</button><div class="mono" style="font-size:9px;color:rgba(0,0,0,0.45);text-align:center;margin-top:12px">${L.legal.plans.larger.foot}</div></div>
</div>
</div>

<div style="margin-top:26px;display:flex;justify-content:center"><div class="mono" style="font-size:10px;color:#555;background:#0A0A0A;border:1px solid rgba(255,255,255,0.1);border-radius:999px;padding:10px 18px;letter-spacing:0.04em">${L.legal.plansLine}</div></div>

<div style="margin-top:36px;background:#0A0A0A;border:1px dashed rgba(255,214,10,0.32);border-radius:16px;padding:18px 20px;display:flex;gap:16px;align-items:start">
<div style="font-size:22px;line-height:1">📄</div>
<div><div class="mono" style="font-size:11px;color:#FFD60A;font-weight:600;letter-spacing:0.02em">${L.legal.ndaBox.title}</div><div style="font-size:13px;color:#888;margin-top:6px;line-height:1.5">${L.legal.ndaBox.desc}</div></div>
</div>

<div style="margin-top:80px;border-top:1px solid rgba(255,255,255,0.08);padding-top:36px">
<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:18px"><span class="mono" style="font-size:11px;letter-spacing:0.18em;color:#666">${L.footer.engines}</span><span style="height:1px;width:32px;background:rgba(255,255,255,0.1)"></span><span class="mono" style="font-size:10px;color:#444">${L.common.vaultSecure}</span></div>
<div style="display:flex;flex-wrap:wrap;gap:7px">
${["DRAFT","ANALYZE","RESEARCH","CASE LAW","LITIGATION","REDLINE","RAG","WORKFLOWS","VAULT","TEAMINVITE","EXPORTDOCX","APIACCESS","COMPLIANCE","RISKSCORE","AI CHAT","MULTI-JURISDICTION"].map(t=>`<span class="mono" style="font-size:10px;letter-spacing:0.08em;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:#0A0A0A;color:#777">${t}</span>`).join('')}
</div>
<div style="margin-top:44px;display:flex;flex-direction:column;gap:8px" class="mono">
<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:10px;color:#444;letter-spacing:0.06em">
<span>© ${new Date().getFullYear()} ${L.common.poweredBy.replace('{year}',new Date().getFullYear())} • ${L.common.soc}</span>
<span style="display:flex;gap:16px"><span>${L.footer.terms}</span><span>${L.footer.dpa}</span><span>${L.footer.security}</span><span>${L.footer.status}</span></span>
</div>
<div style="font-size:9px;color:#333;margin-top:8px">CENTRAL LOCALES: config/locales.js • ${Object.keys(locales).map(l=>`${locales[l].flag} ${l}`).join(' • ')} • Both sides pull from same file • Fingerprint: LEXAI-V3.0.0-20260817</div>
</div>
</div>

</div>

<script>
// Persist lang - both sides use same storage
localStorage.setItem('lexai_lang','${lang}');
localStorage.setItem('lexai_lang_business','${lang}');
document.documentElement.lang='${lang.toLowerCase()}';
// Auto-detect Asia
(function(){
  const saved = localStorage.getItem('lexai_lang');
  if (!saved || saved==='EN') {
    const l = navigator.language.toLowerCase();
    if (l.startsWith('ja') && '${lang}'!=='JA') console.log('JA detected');
    if (l.startsWith('zh') && '${lang}'!=='ZH') console.log('ZH detected');
    if (l.startsWith('ko') && '${lang}'!=='KO') console.log('KO detected');
  }
})();
</script>

</body>
</html>`;

  res.send(html);
});

// API - both sides pull same pricing and languages
router.get('/api/pricing', (req, res) => {
  const lang = getLangFromReq(req);
  const L = locales[lang] || locales.EN;
  res.json({
    lang,
    supported: Object.keys(locales),
    plans: [
      { id: 'basic', price: 49, name: L.legal.plans.basic.name, badge: L.legal.plans.basic.badge, nda: 'Cheaper than 1 NDA $350' },
      { id: 'solo', price: 150, name: L.legal.plans.solo.name },
      { id: 'larger', price: 450, name: L.legal.plans.larger.name, popular: true, users: 5 }
    ],
    centralFile: 'config/locales.js - BOTH SIDES PULL FROM HERE',
    asia: ['JA','ZH','KO'],
    noTrials: true,
    fingerprint: 'LEXAI-V3.0.0-20260817'
  });
});

module.exports = router;
