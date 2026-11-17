import fs from 'node:fs';
import path from 'node:path';

const { username, key } = JSON.parse(fs.readFileSync('E:/Soft/key/kaggle.json', 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${username}:${key}`).toString('base64');
const SLUG = 'china-customs-personal-medication-rules-2026';

async function uploadBlob(filePath) {
  const buf = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const initRes = await fetch('https://www.kaggle.com/api/v1/blobs/upload', {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'DATASET',
      name,
      contentLength: buf.length,
      lastModifiedEpochSeconds: Math.floor(fs.statSync(filePath).mtimeMs / 1000),
    }),
  });
  const initJson = await initRes.json();
  if (!initRes.ok || !initJson.createUrl) {
    throw new Error(`Blob init failed for ${name}: ${initRes.status} ${JSON.stringify(initJson)}`);
  }
  const putRes = await fetch(initJson.createUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': String(buf.length) },
    body: buf,
  });
  if (!putRes.ok) throw new Error(`Blob PUT failed for ${name}: ${putRes.status}`);
  return initJson.token;
}

const files = [
  'dataset/china_customs_medications_38.csv',
  'dataset/china_airport_med_clearance_ports.csv',
  'dataset/china_customs_medications_2026_2027.json',
];

const tokens = [];
for (const f of files) {
  const token = await uploadBlob(f);
  tokens.push({ token });
  console.log('[Kaggle] Uploaded:', path.basename(f));
}

const description = [
  '2026–2027 China Personal Medication Customs Compliance & Pharmacy Equivalency Dataset aligned with GACC Order No. 43, State Council Decree No. 442, and NMPA narcotic/psychotropic schedules.',
  '',
  '### Included Files',
  '- `china_customs_medications_38.csv`: 38 widely traveled international prescription and OTC medications mapped to CAS numbers, RxNorm CUI, INCB schedules, Red/Green customs channels, maximum day allowances, and Chinese generic names (`通用名`).',
  '- `china_airport_med_clearance_ports.csv`: International arrival airport baggage X-ray/CT inspection profiles across PVG, PEK, PKX, and CAN.',
  '- `china_customs_medications_2026_2027.json`: Unified machine-readable JSON bundle.',
  '',
  '### Companion Tools & Open-Source Engine',
  '- Interactive Supply Allowance Calculator: https://chinamedscheck.com/calculator',
  '- Printable Bilingual Customs Card: https://chinamedscheck.com/customs-card',
  '- Zero-Dependency npm Engine (`china-meds-engine`): https://www.npmjs.com/package/china-meds-engine',
  '- Offline Browser Checker (GitHub Pages): https://abigaildavised.github.io/china-meds-engine/',
  '- Hugging Face Static Space: https://huggingface.co/spaces/AbigailDavised/china-medication-customs-checker',
  '',
  '*Disclaimer: Educational regulatory dataset compiled from publicly published PRC customs and pharmaceutical catalogs; zero patient data; does not constitute clinical medical advice.*',
].join('\n');

const subtitle = '38 Rx/OTC customs rules, CAS/RxNorm IDs, day caps & Chinese equivalents.';

const createRes = await fetch('https://www.kaggle.com/api/v1/datasets/create/new', {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'China Personal Medication Customs Rules (2026)',
    slug: SLUG,
    ownerSlug: username,
    subtitle,
    description,
    isPrivate: false,
    licenses: [{ name: 'CC0-1.0' }],
    keywords: ['health', 'public health', 'china', 'law'],
    files: tokens,
  }),
});
console.log('[Kaggle] Create dataset:', createRes.status, await createRes.text());

await new Promise((r) => setTimeout(r, 5000));

const fileSpecs = {
  'china_customs_medications_38.csv': {
    description: '38 international Rx and OTC medications with PRC customs channels, supply ceilings, CAS/RxNorm identifiers, and Chinese pharmacy generic equivalents.',
    columns: {
      slug: 'Canonical medication identifier slug.',
      primary_brand: 'Primary international brand name.',
      all_brands: 'Semicolon-delimited international brand names.',
      generic_name: 'International nonproprietary generic active ingredient name.',
      chinese_name: 'Standard Simplified Chinese generic pharmaceutical name.',
      pinyin: 'Mandarin Pinyin pronunciation for pharmacy communication.',
      category: 'Regulatory classification (BANNED, CONTROLLED, ALLOWED).',
      status_light: 'Traffic-light risk indicator (RED, YELLOW, GREEN).',
      customs_channel: 'Required port-of-entry customs lane.',
      max_allowance_days: 'Statutory or benchmark maximum personal-use days of supply.',
      cas_number: 'Chemical Abstracts Service (CAS) registry number.',
      incb_schedule: 'UN INCB / PRC narcotic or psychotropic schedule.',
      rxnorm_cui: 'US NLM RxNorm Concept Unique Identifier.',
      caac_carry_on: 'CAAC cabin carry-on screening rule.',
      cold_chain_required: '1 if insulated cold-chain pouch required, else 0.',
      refillable_in_china: '1 if legally refillable at PRC hospitals/pharmacies, else 0.',
      legal_basis: 'Primary PRC statutory or customs decree citation.',
      local_alternative: 'Approved therapeutic or OTC alternative in Mainland China.',
    },
  },
  'china_airport_med_clearance_ports.csv': {
    description: 'International arrival airport customs screening characteristics across 4 major Chinese hubs.',
    columns: {
      port_id: 'Airport terminal profile identifier.',
      iata_code: '3-letter IATA airport code.',
      city: 'Municipality name.',
      airport_name: 'Full English international airport name.',
      terminal: 'Evaluated international arrivals terminal.',
      chinese_name: 'Official Simplified Chinese airport and terminal name.',
      walkthrough_steps_count: 'Number of documented arrival clearance stages.',
      inspection_characteristics: 'Summary of pre-arrival CT baggage scanning and Red Channel workflow.',
    },
  },
  'china_customs_medications_2026_2027.json': {
    description: 'Unified JSON bundle combining all 38 medication compliance records and 4 airport screening profiles.',
  },
};

const metaGetRes = await fetch(`https://www.kaggle.com/api/v1/datasets/metadata/${username}/${SLUG}`, {
  headers: { Authorization: authHeader },
});
const metaGet = await metaGetRes.json();
const info = metaGet.info || {};
const updatedData = (info.data || []).map((f) => {
  const s = fileSpecs[f.name];
  if (!s) return f;
  return {
    ...f,
    description: s.description,
    columns: (f.columns || []).map((c) => ({
      ...c,
      description: (s.columns && s.columns[c.name]) || c.description || '',
    })),
  };
});

const metaPostRes = await fetch(`https://www.kaggle.com/api/v1/datasets/metadata/${username}/${SLUG}`, {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...info,
    subtitle,
    isPrivate: false,
    expectedUpdateFrequency: 'quarterly',
    userSpecifiedSources:
      'GACC Order No. 43, State Council Decree No. 442, NMPA Controlled Substance Schedules & US NLM RxNorm/CAS identifiers, structured by ChinaMedsCheck.com.',
    data: updatedData,
  }),
});
console.log('[Kaggle] Metadata update:', metaPostRes.status, await metaPostRes.text());

const notebook = {
  nbformat: 4,
  nbformat_minor: 5,
  metadata: {
    kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
    language_info: { name: 'python', version: '3.10.12' },
  },
  cells: [
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '# China Personal Medication Customs Rules & Day-Cap Analysis (2026)\n\n',
        'Exploratory breakdown of **38 common international Rx & OTC medications** across PRC customs channels (`STRICTLY_FORBIDDEN`, `RED_CHANNEL`, `GREEN_CHANNEL`) and statutory day-supply ceilings.\n\n',
        '- Supply Allowance Calculator: [ChinaMedsCheck.com](https://chinamedscheck.com/calculator)\n',
        '- Printable Bilingual Customs Card: [chinamedscheck.com/customs-card](https://chinamedscheck.com/customs-card)\n',
        '- Zero-Dependency npm Engine (`china-meds-engine`): [deps.dev](https://deps.dev/npm/china-meds-engine)\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        'from pathlib import Path\n',
        'import pandas as pd\n',
        'import matplotlib.pyplot as plt\n\n',
        'BASE = next(Path("/kaggle/input").rglob("china_customs_medications_38.csv")).parent\n',
        'meds = pd.read_csv(BASE / "china_customs_medications_38.csv")\n',
        'ports = pd.read_csv(BASE / "china_airport_med_clearance_ports.csv")\n',
        'print(f"Loaded {len(meds)} medication profiles and {len(ports)} airport hubs.")\n',
        'display(meds[["primary_brand", "generic_name", "category", "customs_channel", "max_allowance_days"]].head(12))\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        'fig, axes = plt.subplots(1, 2, figsize=(13, 5))\n',
        'meds["category"].value_counts().plot(kind="bar", ax=axes[0], color=["#16a34a", "#d97706", "#dc2626"])\n',
        'axes[0].set_title("Evaluated Substances by Regulatory Tier")\n',
        'axes[0].set_ylabel("Medication Count")\n',
        'axes[0].tick_params(axis="x", rotation=0)\n\n',
        'meds.groupby("customs_channel")["max_allowance_days"].mean().sort_values().plot(kind="barh", ax=axes[1], color="#0f4c81")\n',
        'axes[1].set_title("Mean Max Permitted Supply (Days) by Customs Channel")\n',
        'axes[1].set_xlabel("Days of Personal Supply")\n\n',
        'plt.tight_layout()\n',
        'plt.show()\n',
      ],
    },
  ],
};

const pushRes = await fetch('https://www.kaggle.com/api/v1/kernels/push', {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    slug: `${username}/china-medication-customs-rules-eda-2026`,
    newTitle: 'China Medication Customs Rules & Supply EDA',
    text: JSON.stringify(notebook),
    language: 'python',
    kernelType: 'notebook',
    isPrivate: false,
    enableGpu: false,
    enableTpu: false,
    enableInternet: false,
    datasetDataSources: [`${username}/${SLUG}`],
    competitionDataSources: [],
    kernelDataSources: [],
  }),
});
const pushJson = await pushRes.json();
console.log('[Kaggle] Kernel push:', pushRes.status, JSON.stringify(pushJson));
if (pushJson.url) fs.writeFileSync('.kaggle-nb-url.txt', pushJson.url, 'utf8');
