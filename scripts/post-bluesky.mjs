import fs from 'node:fs';

const creds = JSON.parse(fs.readFileSync('E:/Soft/key/bluesky_credentials.json', 'utf8'));
const coverPath = 'E:/Soft/misc/backlink-pipeline/site-assets/chinamedscheck.com/cover.png';

const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: creds.handle,
    password: creds.password || creds.app_password || creds.appPassword,
  }),
});
const session = await sessionRes.json();
if (!session.accessJwt) throw new Error('Bluesky login failed: ' + JSON.stringify(session));

const imgBuf = fs.readFileSync(coverPath);
const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${session.accessJwt}`,
    'Content-Type': 'image/png',
  },
  body: imgBuf,
});
const blobJson = await blobRes.json();

const text =
  'Open-sourced china-meds-engine (0-dep TypeScript) + 2026 China Personal Medication Customs Rules dataset (38 Rx/OTC profiles, CAS/RxNorm) on Kaggle & HF Spaces.\n\n' +
  'Checker: https://chinamedscheck.com/calculator\n' +
  'Kaggle: https://www.kaggle.com/datasets/sotomo/china-customs-personal-medication-rules-2026';

const facets = [];
for (const url of [
  'https://chinamedscheck.com/calculator',
  'https://www.kaggle.com/datasets/sotomo/china-customs-personal-medication-rules-2026',
]) {
  const idx = Buffer.from(text, 'utf8').indexOf(url);
  if (idx >= 0) {
    facets.push({
      index: { byteStart: idx, byteEnd: idx + Buffer.byteLength(url, 'utf8') },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
    });
  }
}

const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${session.accessJwt}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    repo: session.did,
    collection: 'app.bsky.feed.post',
    record: {
      $type: 'app.bsky.feed.post',
      text,
      facets,
      createdAt: new Date().toISOString(),
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: 'https://chinamedscheck.com/calculator',
          title: 'ChinaMedsCheck — China Medication Customs & Supply Allowance Checker',
          description: 'Check GACC Red/Green channel rules, day-supply limits, and bilingual Chinese pharmacy cards for 38 Rx & OTC drugs.',
          thumb: blobJson.blob,
        },
      },
    },
  }),
});
const postJson = await postRes.json();
const rkey = postJson.uri?.split('/').pop();
const postUrl = `https://bsky.app/profile/${creds.handle}/post/${rkey}`;
console.log('[Bluesky] Post URL:', postUrl);
fs.writeFileSync('.bsky-url.txt', postUrl, 'utf8');
