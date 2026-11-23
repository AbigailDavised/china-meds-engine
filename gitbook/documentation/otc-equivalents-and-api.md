# Chinese Pharmacy OTC Equivalents & TypeScript Evaluator API

Even when an incoming prescription medication cannot legally cross Chinese borders for an entire 30-to-180 day stay—such as stimulants above 7 days or non-approved formulations—foreign residents and long-stay visitors can legally obtain equivalent care inside China once they know the local regulatory tier (`hospitalTier`) and Simplified Chinese generic nomenclature.

Look up approved local alternatives and pharmacy naming cards across all **38 indexed substances** on [ChinaMedsCheck.com/drugs](https://chinamedscheck.com/drugs).

## Priority-Weighted Drug Search (`searchMedications`)

The search resolver scores exact generic and brand matches above partial prefix, Chinese generic, CAS number (`casNumber`), and clinical indication (`indications`) hits:

- Score **`100`**: Exact `genericName` or `brandNames` match (e.g., `"ibuprofen"`, `"ritalin"`).
- Score **`80`**: Prefix match on `genericName` or `brandNames`.
- Score **`60` / `40`**: Substring match against `genericName`, `chineseName` (`通用名`), or `brandNames`.
- Score **`20`**: `casNumber` or clinical indication match (`"ADHD"`, `"Narcolepsy"`, `"Bacterial Infections"`).

## Travel Bag Manifest Evaluation & Pharmacy Card Formatting

Engineers building pre-travel health checklists or airline/expat onboarding portals can validate complete multi-drug travel manifests deterministically without external API dependencies:

```typescript
import {
  searchMedications,
  evaluateCustomsAllowance,
  evaluateTravelBagManifest,
  formatBilingualPharmacyCard,
} from 'china-meds-engine';

// 1. Evaluate a multi-medication carry-on bag for a 14-day stay
const manifest = evaluateTravelBagManifest(
  [
    { medicationSlug: 'ibuprofen-in-china', carriedSupplyDays: 14 },
    { medicationSlug: 'ritalin-concerta-in-china', carriedSupplyDays: 7 },
  ],
  14,
);

console.log(manifest.overallChannel); // 'RED_CHANNEL' (strictest item governs)
console.log(manifest.hasForbiddenItems); // false

// 2. Render a bilingual card for Chinese clinic / pharmacy communication
const card = formatBilingualPharmacyCard('ritalin-concerta-in-china');
console.log(card);
```

When refilling prescriptions domestically, note that non-controlled prescription antimicrobials (`azithromycin-in-china`, `amoxicillin`) require a local digital or outpatient doctor's prescription inside China, whereas Category I psychotropics (`Methylphenidate / Concerta`) require a **Grade 3A (`三甲`) hospital psychiatric outpatient red prescription** (`红处方`) or accredited international clinic assessment.

## Companion Open Dataset & Source Repository

- **Open-Source TypeScript Library (`china-meds-engine`)**: [`AbigailDavised/china-meds-engine`](https://github.com/AbigailDavised/china-meds-engine)
- **Kaggle `10.00/10` Companion Dataset**: [China Customs Personal Medication Rules (2026)](https://www.kaggle.com/datasets/sotomo/china-customs-personal-medication-rules-2026)
