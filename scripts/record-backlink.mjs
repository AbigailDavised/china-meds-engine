import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('E:/Soft/misc/backlink-pipeline/node_modules/better-sqlite3');

const gistUrl = fs.existsSync('.gist-url.txt') ? fs.readFileSync('.gist-url.txt', 'utf8').trim() : '';
const bskyUrl = fs.existsSync('.bsky-url.txt') ? fs.readFileSync('.bsky-url.txt', 'utf8').trim() : '';
const nbUrl = fs.existsSync('.kaggle-nb-url.txt')
  ? fs.readFileSync('.kaggle-nb-url.txt', 'utf8').trim()
  : 'https://www.kaggle.com/code/sotomo/china-medication-customs-rules-supply-eda';

const db = new Database('E:/Soft/misc/backlink-pipeline/apps/worker/data/backlink.db');
const insert = db.prepare(`
  INSERT OR IGNORE INTO targets (id, canonical_domain, channel, entry_url, title, language, idempotency_key, created_at)
  VALUES (@id, @canonical_domain, @channel, @entry_url, @title, @language, @idempotency_key, @created_at)
`);

const entries = [
  {
    canonical_domain: 'npmjs.com',
    channel: 'ecosystem_parasite',
    entry_url: 'https://www.npmjs.com/package/china-meds-engine',
    title: 'china-meds-engine@1.0.0 on npm Registry',
    language: 'en',
  },
  {
    canonical_domain: 'deps.dev',
    channel: 'ecosystem_parasite',
    entry_url: 'https://deps.dev/npm/china-meds-engine',
    title: 'china-meds-engine on Google deps.dev (Dofollow homepage -> chinamedscheck.com/calculator)',
    language: 'en',
  },
  {
    canonical_domain: 'huggingface.co',
    channel: 'ecosystem_parasite',
    entry_url: 'https://huggingface.co/spaces/AbigailDavised/china-medication-customs-checker',
    title: 'China Medication Customs & Supply Checker — Hugging Face Space',
    language: 'en',
  },
  {
    canonical_domain: 'github.io',
    channel: 'ecosystem_parasite',
    entry_url: 'https://abigaildavised.github.io/china-meds-engine/',
    title: 'China Medication Customs & Supply Checker — GitHub Pages',
    language: 'en',
  },
  ...(gistUrl
    ? [
        {
          canonical_domain: 'gist.github.com',
          channel: 'ecosystem_parasite',
          entry_url: gistUrl,
          title: '2026–2027 China Personal Medication Customs Rules (38 Substances) — Gist',
          language: 'en',
        },
      ]
    : []),
  {
    canonical_domain: 'kaggle.com',
    channel: 'ecosystem_parasite',
    entry_url: 'https://www.kaggle.com/datasets/sotomo/china-customs-personal-medication-rules-2026',
    title: 'China Personal Medication Customs Rules (2026) — Kaggle Dataset',
    language: 'en',
  },
  {
    canonical_domain: 'kaggle.com',
    channel: 'ecosystem_parasite',
    entry_url: nbUrl,
    title: 'China Medication Customs Rules & Supply EDA — Kaggle Notebook',
    language: 'en',
  },
  ...(bskyUrl
    ? [
        {
          canonical_domain: 'bsky.app',
          channel: 'ecosystem_parasite',
          entry_url: bskyUrl,
          title: 'ChinaMedsCheck Engine & 38-Substance Customs Dataset — Bluesky',
          language: 'en',
        },
      ]
    : []),
];

const now = Date.now();
for (const e of entries) {
  const idempotency_key = crypto.createHash('sha256').update(`${e.channel}:${e.entry_url}`).digest('hex').slice(0, 32);
  const res = insert.run({
    id: crypto.randomUUID(),
    ...e,
    idempotency_key,
    created_at: now,
  });
  console.log(`[backlink.db] ${e.entry_url} -> changes=${res.changes}`);
}
db.close();
