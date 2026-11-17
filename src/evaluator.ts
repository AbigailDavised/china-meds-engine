import {
  AllowanceEvaluation,
  BagManifestEvaluation,
  CustomsChannel,
  DrugClassification,
  MedicationCategory,
  MedicationRecord,
} from './types.js';
import { AIRPORT_CLEARANCE_PORTS, MEDICATIONS_CATALOG } from './data.js';

export function getAllMedications(): MedicationRecord[] {
  return MEDICATIONS_CATALOG;
}

export function getAirportPortProfiles() {
  return AIRPORT_CLEARANCE_PORTS;
}

export function getMedicationBySlug(slug: string): MedicationRecord | undefined {
  return MEDICATIONS_CATALOG.find((m) => m.slug === slug);
}

export function getMedicationsByCategory(category: MedicationCategory): MedicationRecord[] {
  return MEDICATIONS_CATALOG.filter((m) => m.category === category);
}

export function searchMedications(query: string): MedicationRecord[] {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  const scored: { med: MedicationRecord; score: number }[] = [];
  for (const m of MEDICATIONS_CATALOG) {
    let score = 0;
    if (m.genericName.toLowerCase() === q || m.brandNames.some((b) => b.toLowerCase() === q)) {
      score = 100;
    } else if (
      m.genericName.toLowerCase().startsWith(q) ||
      m.brandNames.some((b) => b.toLowerCase().startsWith(q))
    ) {
      score = 80;
    } else if (m.genericName.toLowerCase().includes(q) || m.chineseName.toLowerCase().includes(q)) {
      score = 60;
    } else if (m.brandNames.some((b) => b.toLowerCase().includes(q))) {
      score = 40;
    } else if (
      (m.casNumber && m.casNumber.toLowerCase().includes(q)) ||
      m.indications.some((ind) => ind.toLowerCase().includes(q))
    ) {
      score = 20;
    }
    if (score > 0) scored.push({ med: m, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.med);
}

export function inferClassificationFromMedication(med: MedicationRecord): DrugClassification {
  if (med.category === 'BANNED' || med.channel === 'STRICTLY_FORBIDDEN') {
    return 'BANNED';
  }
  if (med.category === 'CONTROLLED') {
    return med.allowanceDaysMax <= 7 ? 'CONTROLLED_CAT1' : 'CONTROLLED_CAT2';
  }
  return med.allowanceDaysMax <= 90 ? 'MAINTENANCE_RX' : 'OTC';
}

export function evaluateCustomsAllowance(params: {
  medicationSlug?: string;
  classification?: DrugClassification;
  stayDurationDays: number;
  carriedSupplyDays: number;
}): AllowanceEvaluation {
  const stayDurationDays = Math.max(1, Math.round(params.stayDurationDays));
  const carriedSupplyDays = Math.max(1, Math.round(params.carriedSupplyDays));

  let classification: DrugClassification = params.classification || 'MAINTENANCE_RX';
  const med = params.medicationSlug ? getMedicationBySlug(params.medicationSlug) : undefined;
  if (med) {
    classification = inferClassificationFromMedication(med);
  }

  switch (classification) {
    case 'BANNED':
      return {
        classification,
        verdict: 'FORBIDDEN',
        channel: 'STRICTLY_FORBIDDEN',
        maxRecommendedDays: 0,
        carriedSupplyDays,
        stayDurationDays,
        requiresDoctorCertificate: false,
        requiresLocalHospitalRefill: true,
        summaryAdvice:
          'Strictly prohibited at PRC ports of entry under GACC / NMPA narcotics & psychotropics schedules. Do not pack; consult an international hospital in China for legal alternatives.',
      };

    case 'CONTROLLED_CAT1': {
      const verdict =
        carriedSupplyDays <= 7 ? 'COMPLIANT' : carriedSupplyDays <= 15 ? 'WARNING' : 'HIGH_RISK';
      return {
        classification,
        verdict,
        channel: 'RED_CHANNEL',
        maxRecommendedDays: 7,
        carriedSupplyDays,
        stayDurationDays,
        requiresDoctorCertificate: true,
        requiresLocalHospitalRefill: stayDurationDays > 7,
        summaryAdvice:
          verdict === 'COMPLIANT'
            ? 'Declare at the Red Channel with original packaging, signed medical certificate, and prescription (<= 7-day statutory ceiling for Class I psychotropics/narcotics).'
            : 'Exceeds standard 7-day Class I psychotropic personal-use ceiling; high risk of customs seizure without special hospital documentation.',
      };
    }

    case 'CONTROLLED_CAT2': {
      const verdict =
        carriedSupplyDays <= 15 ? 'COMPLIANT' : carriedSupplyDays <= 30 ? 'WARNING' : 'HIGH_RISK';
      return {
        classification,
        verdict,
        channel: 'RED_CHANNEL',
        maxRecommendedDays: 15,
        carriedSupplyDays,
        stayDurationDays,
        requiresDoctorCertificate: true,
        requiresLocalHospitalRefill: stayDurationDays > 15,
        summaryAdvice:
          verdict === 'COMPLIANT'
            ? 'Declare at the Red Channel with original pharmacy bottle and doctor prescription (<= 15-day Class II psychotropic personal-use guideline).'
            : 'Above 15-day Class II psychotropic personal-use threshold; prepare itemized medical letter and expect inspection.',
      };
    }

    case 'MAINTENANCE_RX': {
      const verdict = carriedSupplyDays <= 90 ? 'COMPLIANT' : 'WARNING';
      return {
        classification,
        verdict,
        channel: carriedSupplyDays <= 90 ? 'GREEN_CHANNEL' : 'RED_CHANNEL',
        maxRecommendedDays: 90,
        carriedSupplyDays,
        stayDurationDays,
        requiresDoctorCertificate: true,
        requiresLocalHospitalRefill: stayDurationDays > 90,
        summaryAdvice:
          verdict === 'COMPLIANT'
            ? 'Permitted for reasonable personal use (up to ~30–90 days) in original labeled containers with matching prescription copy.'
            : 'Exceeds 90-day reasonable personal-use benchmark; declare at Red Channel to avoid commercial import classification.',
      };
    }

    case 'OTC':
    default: {
      const verdict = carriedSupplyDays <= 180 ? 'COMPLIANT' : 'WARNING';
      return {
        classification: 'OTC',
        verdict,
        channel: carriedSupplyDays <= 180 ? 'GREEN_CHANNEL' : 'RED_CHANNEL',
        maxRecommendedDays: 180,
        carriedSupplyDays,
        stayDurationDays,
        requiresDoctorCertificate: false,
        requiresLocalHospitalRefill: false,
        summaryAdvice:
          verdict === 'COMPLIANT'
            ? 'Standard non-controlled OTC medication within personal-use quantity; keep in original retail blister packs.'
            : 'Bulk OTC volume may trigger customs value/commercial inspection; reduce to personal trip quantity.',
      };
    }
  }
}

export function evaluateTravelBagManifest(
  items: { medicationSlug: string; carriedSupplyDays: number }[],
  stayDurationDays: number,
): BagManifestEvaluation {
  let overallChannel: CustomsChannel = 'GREEN_CHANNEL';
  let hasForbiddenItems = false;
  let hasRedChannelItems = false;

  const evaluated = items.map((item) => {
    const res = evaluateCustomsAllowance({
      medicationSlug: item.medicationSlug,
      stayDurationDays,
      carriedSupplyDays: item.carriedSupplyDays,
    });
    if (res.channel === 'STRICTLY_FORBIDDEN') {
      hasForbiddenItems = true;
      overallChannel = 'STRICTLY_FORBIDDEN';
    } else if (res.channel === 'RED_CHANNEL') {
      hasRedChannelItems = true;
      if (overallChannel !== 'STRICTLY_FORBIDDEN') overallChannel = 'RED_CHANNEL';
    }
    return {
      slugOrName: item.medicationSlug,
      verdict: res.verdict,
      channel: res.channel,
      advice: res.summaryAdvice,
    };
  });

  return {
    itemCount: evaluated.length,
    overallChannel,
    hasForbiddenItems,
    hasRedChannelItems,
    items: evaluated,
  };
}

export function formatBilingualPharmacyCard(slug: string): string | null {
  const med = getMedicationBySlug(slug);
  if (!med) return null;
  return [
    `[English Brand / Generic]: ${med.brandNames.join(', ')} (${med.genericName})`,
    `[Chinese Generic Name 通用名]: ${med.pharmacyShowName || med.chineseName}`,
    med.pinyin ? `[Pinyin]: ${med.pinyin}` : '',
    med.chinaOtcBrands.length > 0 ? `[Common China Brands]: ${med.chinaOtcBrands.join(' / ')}` : '',
    `[Customs Status]: ${med.category} (${med.channel}, max ${med.allowanceDaysMax}d)`,
  ]
    .filter(Boolean)
    .join('\n');
}
