# China Personal Medication Customs Engine Documentation

Welcome to the regulatory data schema and API documentation for [**ChinaMedsCheck (chinamedscheck.com)**](https://chinamedscheck.com) and the zero-dependency [`china-meds-engine`](https://github.com/AbigailDavised/china-meds-engine) TypeScript library.

International travelers arriving at Mainland Chinese ports frequently overlook how sharply PRC narcotics and psychotropic classification diverges from North American, European, or Australian prescribing practices. Common outpatient prescriptions for ADHD, anxiety, chronic pain, or sleep disorders—even when carried in legitimate home-country pharmacy bottles—may fall into strictly prohibited Class I schedules or require formal Red Channel written declaration under **State Council Decree No. 442** and **GACC Order No. 43**.

Use our interactive browser utilities at [ChinaMedsCheck.com](https://chinamedscheck.com) to inspect exact medication clearance status via the [Supply Allowance Calculator](https://chinamedscheck.com/calculator), search all **38 indexed substances** in the [Customs Medication Database](https://chinamedscheck.com/drugs), or generate a printable passport-matched declaration sheet with the [Bilingual Customs Card Builder](https://chinamedscheck.com/customs-card).

## Core Reference Scope (`MEDICATIONS_CATALOG` & `evaluator.ts`)

The engine encodes structured regulatory metadata derived from PRC Criminal Law Articles 347 & 357, State Council Narcotic & Psychotropic Schedules, National Medical Products Administration (NMPA) registries, and UN INCB reporting schedules:

- **Three Primary Legal Tiers (`38` Total Active & Reference Profiles)**: Maps **`4` strictly prohibited (`BANNED`)**, **`16` controlled (`CONTROLLED`)**, and **`18` permitted (`ALLOWED`)** medications across international brand names (`brandNames`), INN generic compounds (`genericName`), CAS Registry numbers (`casNumber`), and RxNorm concept identifiers (`rxnormCui`).
- **Four-Tier Statutory Supply Evaluator (`evaluateCustomsAllowance`)**: Evaluates carried supply days (`carriedSupplyDays`) against maximum recommended personal-use caps (`0d`, `7d`, `15d`, `90d`, `180d`) and returns explicit customs lane routing (`STRICTLY_FORBIDDEN`, `RED_CHANNEL`, `GREEN_CHANNEL`).
- **Four Major International Arrival Airport Profiles (`AIRPORT_CLEARANCE_PORTS`)**: Documents checked-baggage pre-inspection CT workflows (`先期机检`) and customs screening protocols at Shanghai Pudong (`PVG` T2), Beijing Capital (`PEK` T3), Guangzhou Baiyun (`CAN` T2), and Beijing Daxing (`PKX`).
- **Chinese Pharmacy Equivalents (`formatBilingualPharmacyCard`)**: Pairs restricted foreign medications with legal in-country therapeutic alternatives, Simplified Chinese generic names, Mandarin Pinyin, and clinic refill tiers (`Grade 3A Psychiatric Outpatient` vs. international clinics).

## Handbook Chapters

- **[Controlled & Prohibited Substance Schedules (38 Medications)](controlled-and-banned-schedules.md)** — How ADHD stimulants (`Adderall`, `Vyvanse` vs. `Concerta`), benzodiazepines, sleep aids, and hormone therapies map under PRC regulatory schedules.
- **[Customs Lanes, Supply Day Caps & Airport Port Profiles](customs-declaration-day-caps.md)** — Exact decision logic for `CONTROLLED_CAT1` (7d), `CONTROLLED_CAT2` (15d), `MAINTENANCE_RX` (90d), `OTC` (180d), and Red vs. Green Channel arrival walkthroughs at `PVG`, `PEK`, `CAN`, and `PKX`.
- **[Chinese Pharmacy OTC Equivalents & TypeScript Evaluator API](otc-equivalents-and-api.md)** — Deterministic search scoring (`searchMedications`), multi-item travel bag evaluation (`evaluateTravelBagManifest`), and bilingual hospital pharmacy card generation.

## Medical & Regulatory Independence Notice

`ChinaMedsCheck` and `china-meds-engine` serve strictly as educational regulatory reference tools built from publicly available PRC customs and pharmaceutical schedules. This documentation **does not constitute medical advice, prescription replacement guidance, or formal legal representation**; travelers must consult prescribing clinicians before altering medications and confirm port-specific declaration requirements with China Customs (GACC 12360).
