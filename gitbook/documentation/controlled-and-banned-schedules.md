# Controlled & Prohibited Substance Schedules (38 Medications)

Before packing prescription medications for travel to Mainland China, international visitors must classify active ingredients by **chemical compound** rather than brand packaging. Under PRC law, certain medications considered routine first-line outpatient therapy abroad carry criminal smuggling liability at Chinese ports, while closely related molecules within the same therapeutic indication remain legally declarable or refillable locally.

Review complete pre-travel entry guidance in our [Bringing Personal Medications into China Guide](https://chinamedscheck.com/guide/bring-medications-to-china) and specialized [ADHD Medication in China Rules](https://chinamedscheck.com/guide/adhd-medication-in-china).

## Four Regulatory Classifications (`DrugClassification`)

Within `inferClassificationFromMedication()` (`src/evaluator.ts`), each entry inside `MEDICATIONS_CATALOG` resolves cleanly into five operational enforcement states:

1. **`BANNED` (`4` Indexed Compounds — `STRICTLY_FORBIDDEN`)**: Amphetamine-class stimulants and Schedule I narcotics under Articles 347 & 357 of the PRC Criminal Law and State Council Narcotic Schedules. Example: **Adderall / Dextroamphetamine (`adderall-in-china`, CAS `300-62-9`)** and **Lisdexamfetamine / Vyvanse (`vyvanse-in-china`, CAS `608137-32-2`)** carry a statutory `0`-day personal allowance (`redLineWarning: true`) and must never be packed or declared at arrival.
2. **`CONTROLLED_CAT1` (`<= 7`-Day Personal Supply — `RED_CHANNEL`)**: Category I psychotropics and strict controlled narcotics under State Council Decree No. 442 Article 44. For example, **Methylphenidate (`ritalin-concerta-in-china`, CAS `113-45-1`)** is strictly controlled for ADHD/narcolepsy but legally permitted for personal carry-on up to **7 days** when declared at the Customs Red Channel with original prescription, physician diagnosis letter, and matching passport. Longer stays require local psychiatric outpatient refilling (`专注达 Concerta` or non-stimulant `Strattera`).
3. **`CONTROLLED_CAT2` (`<= 15`-Day Personal Supply — `RED_CHANNEL`)**: Category II psychotropic substances permitted up to **15 days** under Red Channel written declaration with original labeled pharmacy bottles and clinical letter.
4. **`MAINTENANCE_RX` (`<= 90`-Day Reasonable Personal Use) & `OTC` (`<= 180` Days)**: Non-controlled chronic maintenance medications (e.g., oral antimicrobials, general non-narcotic therapies) and standard over-the-counter items (`OTC`) cleared for Green Channel entry when kept in original blister packs for personal use. (Note: **Testosterone / Estradiol HRT**, `testosterone-hrt-in-china`, falls under PRC Anti-Doping Decree No. 398 with an `allowanceDaysMax` of 90 days requiring a passport-matched doctor prescription and Red Channel declaration for injectable vials/syringes.)

## Why Chemical Generic Conversion Matters Before Flying

Chinese hospital pharmacies, Grade 3A clinics, and customs X-ray inspectors index drugs by INN chemical nomenclature and Simplified Chinese generic names rather than foreign retail brands:

- Searching `Adderall` vs. `Methylphenidate` separates an **illicit entry hazard (`BANNED`)** from a **declarable `7`-day prescription (`CONTROLLED_CAT1`)** or **legally available non-stimulant (`Atomoxetine / Strattera`)**.
- Searching `CAS Registry Number` (`e.g. 113-45-1` for methylphenidate or `58-22-0` for testosterone) resolves brand ambiguity across US, UK, EU, and Australian packaging inside `searchMedications()`.

Search any brand, generic molecule, or CAS ID live in the [China NMPA & Customs Drug Database](https://chinamedscheck.com/drugs).
