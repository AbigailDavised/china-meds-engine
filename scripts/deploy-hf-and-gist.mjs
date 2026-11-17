import fs from 'node:fs';

const hfToken = fs.readFileSync('E:/Soft/key/huggingface_token.txt', 'utf8').trim();
const ghDoc = fs.readFileSync('E:/Soft/key/GITHUB_TOKEN.md', 'utf8');
const ghMatches = ghDoc.match(/ghp_[A-Za-z0-9]+/g);
if (!ghMatches || ghMatches.length < 2) throw new Error('Could not locate AbigailDavised GitHub token in GITHUB_TOKEN.md');
const ghToken = ghMatches[1];

const repoId = 'AbigailDavised/china-medication-customs-checker';

const createRes = await fetch('https://huggingface.co/api/repos/create', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${hfToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'space',
    name: 'china-medication-customs-checker',
    sdk: 'static',
    private: false,
  }),
});
console.log('[HF] Create Space:', createRes.status, await createRes.text());

const readmeB64 = Buffer.from(fs.readFileSync('hf-space/README.md', 'utf8'), 'utf8').toString('base64');
const htmlB64 = Buffer.from(fs.readFileSync('hf-space/index.html', 'utf8'), 'utf8').toString('base64');
const ndjson = [
  JSON.stringify({ key: 'header', value: { summary: 'feat: deploy China medication customs checker static space' } }),
  JSON.stringify({ key: 'file', value: { content: readmeB64, path: 'README.md', encoding: 'base64' } }),
  JSON.stringify({ key: 'file', value: { content: htmlB64, path: 'index.html', encoding: 'base64' } }),
].join('\n');

const commitRes = await fetch(`https://huggingface.co/api/spaces/${repoId}/commit/main`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${hfToken}`,
    'Content-Type': 'application/x-ndjson',
  },
  body: ndjson,
});
console.log('[HF] Commit:', commitRes.status, await commitRes.text());

const medsCsv = fs.readFileSync('dataset/china_customs_medications_38.csv', 'utf8');
const portsCsv = fs.readFileSync('dataset/china_airport_med_clearance_ports.csv', 'utf8');

const gistRes = await fetch('https://api.github.com/gists', {
  method: 'POST',
  headers: {
    Authorization: `token ${ghToken}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'china-meds-engine-setup',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: '2026–2027 China Personal Medication Customs Rules (38 Rx/OTC Substances & Airport Inspection Profiles) — ChinaMedsCheck.com',
    public: true,
    files: {
      'china_customs_medications_38.csv': { content: medsCsv },
      'china_airport_med_clearance_ports.csv': { content: portsCsv },
      'README.md': {
        content: [
          '# China Personal Medication Customs Reference (2026–2027)',
          '',
          '- Supply Allowance Calculator: https://chinamedscheck.com/calculator',
          '- 38-Substance Customs Database: https://chinamedscheck.com/drugs',
          '- Bilingual Customs Declaration Card: https://chinamedscheck.com/customs-card',
          '- Bringing Personal Medications Guide: https://chinamedscheck.com/guide/bring-medications-to-china',
          '- Zero-Dependency npm Engine: https://www.npmjs.com/package/china-meds-engine',
          '',
          '*Educational regulatory reference only — not clinical medical advice.*',
        ].join('\n'),
      },
    },
  }),
});
const gistJson = await gistRes.json();
console.log('[Gist] Created:', gistRes.status, gistJson.html_url);
fs.writeFileSync('.gist-url.txt', gistJson.html_url || '', 'utf8');
