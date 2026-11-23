# Customs Lanes, Supply Day Caps & Airport Port Profiles

Whether a passenger walks smoothly through the **Nothing to Declare (Green Channel)** or must stop at the **Goods to Declare (Red Channel)** depends on the highest-restriction molecule inside their carry-on or checked luggage—even if every other bottle in the bag is standard OTC medicine.

Simulate multi-medication luggage combinations directly inside our [Personal Supply Allowance Calculator](https://chinamedscheck.com/calculator) and prepare translated paperwork using the [Bilingual Customs Declaration Card Builder](https://chinamedscheck.com/customs-card).

## Statutory Threshold Matrix (`evaluateCustomsAllowance`)

The threshold engine computes exact clearance verdicts (`COMPLIANT`, `WARNING`, `HIGH_RISK`, `FORBIDDEN`) by comparing `carriedSupplyDays` against category ceilings:

| `DrugClassification` | Recommended Max Supply | Default Customs Lane | Warning Trigger | Local Refill Needed When `stayDurationDays >` |
| :--- | :---: | :--- | :--- | :---: |
| **`BANNED`** | **0 days** | `STRICTLY_FORBIDDEN` | Any quantity (`> 0`) | Always (replace pre-travel) |
| **`CONTROLLED_CAT1`** | **7 days** | `RED_CHANNEL` | `8–15 days` (`WARNING`); `> 15d` (`HIGH_RISK`) | `7 days` |
| **`CONTROLLED_CAT2`** | **15 days** | `RED_CHANNEL` | `16–30 days` (`WARNING`); `> 30d` (`HIGH_RISK`) | `15 days` |
| **`MAINTENANCE_RX`** | **90 days** | `GREEN_CHANNEL` (`<= 90d`) | `> 90 days` shifts to `RED_CHANNEL` (`WARNING`) | `90 days` |
| **`OTC`** | **180 days** | `GREEN_CHANNEL` (`<= 180d`) | `> 180 days` shifts to `RED_CHANNEL` (`WARNING`) | N/A |

Every controlled arrival (`CONTROLLED_CAT1`, `CONTROLLED_CAT2`, or `RED_CHANNEL` hormone injectables) requires carrying medications in **original pharmacy-labeled containers**, accompanied by an original signed physician diagnosis certificate, prescription sheet matching the traveler's passport name, and carry-on packaging rather than unmarked pill organizers.

## Arrival Baggage Inspection Across Four International Hub Airports (`AIRPORT_CLEARANCE_PORTS`)

Travelers entering Mainland China should anticipate automated CT imaging prior to customs exit, especially at primary Tier-1 arrival gateways documented in `src/data.ts`:

1. **Shanghai Pudong (`PVG` — Terminal 2)**: Uses automated **"Pre-inspection Before Arrival" (先期机检)**. Checked bags pass high-speed CT scanners before reaching carousels; luggage flagged for bulk pills, powders, or undeclared biologics receives an electronic yellow tamper-evident lock band requiring customs inspection.
2. **Beijing Capital (`PEK` — Terminal 3E/3C)**: Two-stage satellite transit where Capital Airport Customs maintains strict chemical and narcotics vigilance due to capital security screening standards.
3. **Beijing Daxing (`PKX` — Main Terminal)**: Features integrated underground conveyor CT pre-clearance (`100% Pre-clearance High-Speed CT`), screening checked bags seamlessly before baggage delivery.
4. **Guangzhou Baiyun (`CAN` — Terminal 2)**: Major southern hub connecting Southeast Asia, Europe, and Oceania, placing elevated screening focus on controlled stimulants and precursor substances.

If carrying any `CONTROLLED` compound, pack medications in **hand-carried cabin luggage** alongside wet-signed clinical documentation and proceed proactively to the Red Channel desk upon arrival.
