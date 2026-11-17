# china-meds-engine

Zero-dependency TypeScript engine for **China Personal Medication Customs Compliance** (aligned with GACC Order No. 43, State Council Decree No. 442 on Narcotic & Psychotropic Substances, and NMPA schedules). Includes **38 international Rx & OTC substance profiles** (CAS numbers, RxNorm CUI, INCB schedules, CAAC carry-on rules, and Chinese pharmacy generic equivalents), **4 international airport inspection profiles**, and deterministic Red/Green Channel supply evaluators.

- **Interactive Supply Allowance Calculator**: [chinamedscheck.com/calculator](https://chinamedscheck.com/calculator)
- **Full 38-Substance Customs Database**: [chinamedscheck.com/drugs](https://chinamedscheck.com/drugs)
- **Bilingual Customs Declaration Card Builder**: [chinamedscheck.com/customs-card](https://chinamedscheck.com/customs-card)
- **Bringing Personal Medications into China Guide**: [chinamedscheck.com/guide/bring-medications-to-china](https://chinamedscheck.com/guide/bring-medications-to-china)
- **ADHD Medication in China Rules**: [chinamedscheck.com/guide/adhd-medication-in-china](https://chinamedscheck.com/guide/adhd-medication-in-china)
- **China OTC Pharmacy Equivalents Guide**: [chinamedscheck.com/guide/buy-otc-medicine-in-china](https://chinamedscheck.com/guide/buy-otc-medicine-in-china)
- **Offline Browser Checker (GitHub Pages)**: [abigaildavised.github.io/china-meds-engine](https://abigaildavised.github.io/china-meds-engine/)

## Installation

```bash
npm install china-meds-engine
```

## Quick Start

```ts
import {
  searchMedications,
  evaluateCustomsAllowance,
  evaluateTravelBagManifest,
  formatBilingualPharmacyCard,
} from 'china-meds-engine';

const hits = searchMedications('ibuprofen');
console.log(hits[0].chineseName);

const verdict = evaluateCustomsAllowance({
  medicationSlug: 'ritalin-concerta-in-china',
  stayDurationDays: 14,
  carriedSupplyDays: 7,
});
console.log(verdict);
// { classification: 'CONTROLLED_CAT1', verdict: 'COMPLIANT', channel: 'RED_CHANNEL', maxRecommendedDays: 7, ... }

const bag = evaluateTravelBagManifest(
  [
    { medicationSlug: 'ibuprofen-in-china', carriedSupplyDays: 14 },
    { medicationSlug: 'xanax-in-china', carriedSupplyDays: 10 },
  ],
  14,
);
console.log(bag.overallChannel); // 'RED_CHANNEL'

console.log(formatBilingualPharmacyCard('ibuprofen-in-china'));
```

## Medical & Regulatory Disclaimer

This library provides educational regulatory structuring based on publicly published PRC customs and pharmaceutical schedules. It **does not constitute clinical medical advice, prescription guidance, or formal legal counsel**. Always consult your prescribing physician and verify port-of-entry rules with China Customs (GACC 12360) prior to travel.

## License

MIT — Maintained by [Abigail Davis](https://github.com/AbigailDavised) (`abigaild@agentmail.to`) for [ChinaMedsCheck.com](https://chinamedscheck.com).
