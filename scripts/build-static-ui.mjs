import fs from 'node:fs';
import { getAllMedications, getAirportPortProfiles } from '../dist/esm/index.js';

const meds = getAllMedications();
const ports = getAirportPortProfiles();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>China Personal Medication Customs Checker (2026–2027) — china-meds-engine</title>
  <style>
    :root { --bg:#f8fafc; --card:#ffffff; --text:#0f172a; --muted:#475569; --accent:#0f4c81; --border:#e2e8f0; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; background:var(--bg); color:var(--text); line-height:1.5; }
    .wrap { max-width:980px; margin:0 auto; padding:24px 16px 48px; }
    header { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-end; gap:12px; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:14px; }
    h1 { font-size:1.45rem; margin:0; }
    .sub { color:var(--muted); font-size:0.9rem; margin:4px 0 0; }
    .links { display:flex; gap:12px; flex-wrap:wrap; font-size:0.85rem; }
    .links a { color:var(--accent); text-decoration:none; font-weight:600; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:16px; }
    .card { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:16px; }
    .card h2 { font-size:1.05rem; margin:0 0 12px; }
    label { display:block; font-size:0.82rem; font-weight:600; color:var(--muted); margin:10px 0 4px; }
    input, select { width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem; background:#fff; }
    .verdict { border-radius:8px; padding:12px 14px; margin-bottom:12px; border:1px solid var(--border); }
    .v-FORBIDDEN, .v-HIGH_RISK { background:#fef2f2; border-color:#fecaca; color:#991b1b; }
    .v-WARNING { background:#fffbeb; border-color:#fde68a; color:#92400e; }
    .v-COMPLIANT { background:#ecfdf5; border-color:#a7f3d0; color:#065f46; }
    .pharm { background:#f1f5f9; border-radius:8px; padding:12px; font-size:0.88rem; }
    footer { margin-top:24px; padding-top:14px; border-top:1px solid var(--border); font-size:0.8rem; color:var(--muted); display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; }
    footer a { color:var(--accent); text-decoration:none; font-weight:600; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>China Medication Customs &amp; Supply Checker (2026–2027)</h1>
        <p class="sub">Client-side GACC Decree 43 &amp; State Council Decree 442 evaluator across 38 Rx &amp; OTC substances.</p>
      </div>
      <div class="links">
        <a href="https://chinamedscheck.com/calculator" target="_blank" rel="noopener noreferrer">Full Web Calculator</a>
        <a href="https://chinamedscheck.com/customs-card" target="_blank" rel="noopener noreferrer">Printable Customs Card</a>
        <a href="https://chinamedscheck.com/drugs" target="_blank" rel="noopener noreferrer">38-Drug Index</a>
        <a href="https://www.npmjs.com/package/china-meds-engine" target="_blank" rel="noopener noreferrer">npm Package</a>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Select Medication &amp; Trip Supply</h2>
        <label for="medSelect">Medication (Brand / Generic)</label>
        <select id="medSelect"></select>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label for="stayDays">Stay Duration (Days)</label>
            <input id="stayDays" type="number" value="14" min="1" max="180" />
          </div>
          <div>
            <label for="supplyDays">Carried Supply (Days)</label>
            <input id="supplyDays" type="number" value="14" min="1" max="180" />
          </div>
        </div>

        <label for="portSelect">Arrival Airport Inspection Profile</label>
        <select id="portSelect"></select>
        <p id="portNote" style="font-size:0.8rem; color:var(--muted); margin:8px 0 0;"></p>
      </div>

      <div class="card">
        <h2>Customs Border Verdict &amp; Bilingual Pharmacy Card</h2>
        <div id="verdictBox" class="verdict"></div>
        <div id="pharmBox" class="pharm"></div>
      </div>
    </div>

    <footer>
      <span>Educational regulatory reference by <strong>ChinaMedsCheck.com</strong> (MIT License) — not clinical medical advice.</span>
      <span>Need printable bilingual doctor &amp; customs PDF? <a href="https://chinamedscheck.com/customs-card" target="_blank" rel="noopener noreferrer">Build Customs Declaration Card →</a></span>
    </footer>
  </div>

  <script>
    const MEDS = ${JSON.stringify(meds)};
    const PORTS = ${JSON.stringify(ports)};

    const sel = document.getElementById('medSelect');
    MEDS.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = \`[\${m.category}] \${m.brandNames[0]} (\${m.genericName}) — \${m.chineseName}\`;
      sel.appendChild(opt);
    });

    const psel = document.getElementById('portSelect');
    PORTS.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = \`\${p.iataCode} — \${p.airportName} (\${p.terminal})\`;
      psel.appendChild(opt);
    });

    function evaluate() {
      const m = MEDS[Number(sel.value) || 0];
      const stay = Math.max(1, Number(document.getElementById('stayDays').value) || 14);
      const sup = Math.max(1, Number(document.getElementById('supplyDays').value) || 14);
      const p = PORTS[Number(psel.value) || 0];
      document.getElementById('portNote').textContent = p.inspectionCharacteristics;

      let v = 'COMPLIANT', ch = m.channel, msg = '';
      if (m.category === 'BANNED' || m.channel === 'STRICTLY_FORBIDDEN') {
        v = 'FORBIDDEN'; ch = 'STRICTLY FORBIDDEN';
        msg = 'Prohibited at PRC ports of entry. Do not pack; consult a Tier-3 international hospital in China for legal alternatives.';
      } else if (m.category === 'CONTROLLED') {
        const cap = m.allowanceDaysMax <= 7 ? 7 : 15;
        const warnCap = cap === 7 ? 15 : 30;
        v = sup <= cap ? 'COMPLIANT' : sup <= warnCap ? 'WARNING' : 'HIGH_RISK';
        ch = 'RED CHANNEL DECLARATION';
        msg = sup <= cap
          ? \`Within \${cap}-day controlled personal-use ceiling. Declare at Red Channel with original bottle + signed medical certificate.\`
          : \`Exceeds \${cap}-day controlled threshold (\${m.legalBasis}). High risk of detention if undeclared.\`;
      } else {
        const cap = m.allowanceDaysMax || 90;
        v = sup <= cap ? 'COMPLIANT' : 'WARNING';
        ch = sup <= cap ? 'GREEN CHANNEL' : 'RED CHANNEL';
        msg = sup <= cap
          ? \`Permitted personal-use quantity (up to \${cap} days) in original pharmacy packaging.\`
          : \`Exceeds \${cap}-day reasonable personal-use benchmark; reduce volume or declare.\`;
      }

      const vbox = document.getElementById('verdictBox');
      vbox.className = 'verdict v-' + v;
      vbox.innerHTML = \`<strong>\${v} · \${ch}</strong><div style="font-size:0.86rem;margin-top:4px;">\${msg}</div>\`;

      document.getElementById('pharmBox').innerHTML = \`
        <div><strong>Chinese Generic Name:</strong> \${m.pharmacyShowName || m.chineseName} \${m.pinyin ? '('+m.pinyin+')' : ''}</div>
        <div style="margin-top:4px;"><strong>CAS / Schedule:</strong> \${m.casNumber || 'N/A'} · \${m.incbCategory || m.legalBasis}</div>
        <div style="margin-top:4px;"><strong>Local China Alternative / OTC:</strong> \${(m.chinaOtcBrands && m.chinaOtcBrands.length ? m.chinaOtcBrands.join(', ') + ' — ' : '') + m.localAlternative}</div>
      \`;
    }

    ['medSelect','stayDays','supplyDays','portSelect'].forEach(id => document.getElementById(id).addEventListener('input', evaluate));
    evaluate();
  </script>
</body>
</html>`;

fs.writeFileSync('hf-space/index.html', html, 'utf8');
fs.writeFileSync('docs/index.html', html, 'utf8');
console.log('Generated ChinaMedsCheck static UI, size KB:', (html.length / 1024).toFixed(1));
