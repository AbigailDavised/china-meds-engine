import fs from 'node:fs';

const rawMeds = JSON.parse(
  fs.readFileSync('E:/Soft/xoesim/ChinaMedsCheck/data/medications.json', 'utf8'),
);
const rawPorts = JSON.parse(
  fs.readFileSync('E:/Soft/xoesim/ChinaMedsCheck/data/portWalkthroughs.json', 'utf8'),
);

const cleanMeds = rawMeds.map((m) => ({
  slug: m.slug,
  brandNames: m.brandNames || [],
  genericName: m.genericName,
  chineseName: m.chineseName,
  pinyin: m.pinyin || undefined,
  pharmacyShowName: m.pharmacyShowName || undefined,
  category: m.category,
  status: m.status,
  allowanceDaysMax: Number(m.allowanceDaysMax ?? 0),
  channel: m.channel,
  legalBasis: m.legalBasis,
  declarationRequirement: m.declarationRequirement,
  localAlternative: m.localAlternative,
  chinaOtcBrands: m.chinaOtcBrands || [],
  indications: m.indications || [],
  casNumber: m.casNumber || undefined,
  incbCategory: m.incbCategory || undefined,
  rxnormCui: m.rxnormCui || undefined,
  redLineWarning: Boolean(m.redLineWarning),
  caacCarryOn: m.clearanceProfiles?.caacAviation?.carryOn || undefined,
  coldChain: Boolean(m.clearanceProfiles?.caacAviation?.coldChain),
  refillableInChina: Boolean(m.clearanceProfiles?.localRefill?.refillableInChina),
  hospitalTier: m.clearanceProfiles?.localRefill?.hospitalTier || undefined,
}));

const cleanPorts = rawPorts.map((p) => ({
  id: p.id,
  iataCode: p.iataCode,
  city: p.city,
  airportName: p.airportName,
  terminal: p.terminal,
  chineseName: p.chineseName,
  inspectionCharacteristics: p.inspectionCharacteristics,
  stepsCount: Array.isArray(p.walkthroughSteps) ? p.walkthroughSteps.length : 0,
}));

const tsOut = [
  "import { AirportPortProfile, MedicationRecord } from './types.js';",
  '',
  'export const MEDICATIONS_CATALOG: MedicationRecord[] = ' + JSON.stringify(cleanMeds, null, 2) + ';',
  '',
  'export const AIRPORT_CLEARANCE_PORTS: AirportPortProfile[] = ' + JSON.stringify(cleanPorts, null, 2) + ';',
  '',
].join('\n');
fs.writeFileSync('src/data.ts', tsOut, 'utf8');

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const medHeader = [
  'slug',
  'primary_brand',
  'all_brands',
  'generic_name',
  'chinese_name',
  'pinyin',
  'category',
  'status_light',
  'customs_channel',
  'max_allowance_days',
  'cas_number',
  'incb_schedule',
  'rxnorm_cui',
  'caac_carry_on',
  'cold_chain_required',
  'refillable_in_china',
  'legal_basis',
  'local_alternative',
];

const medRows = cleanMeds.map((m) => [
  m.slug,
  m.brandNames[0] || '',
  m.brandNames.join('; '),
  m.genericName,
  m.chineseName,
  m.pinyin || '',
  m.category,
  m.status,
  m.channel,
  m.allowanceDaysMax,
  m.casNumber || '',
  m.incbCategory || '',
  m.rxnormCui || '',
  m.caacCarryOn || '',
  m.coldChain ? 1 : 0,
  m.refillableInChina ? 1 : 0,
  m.legalBasis,
  m.localAlternative,
]);

fs.writeFileSync(
  'dataset/china_customs_medications_38.csv',
  [medHeader, ...medRows].map((r) => r.map(csvEscape).join(',')).join('\n') + '\n',
  'utf8',
);

const portHeader = [
  'port_id',
  'iata_code',
  'city',
  'airport_name',
  'terminal',
  'chinese_name',
  'walkthrough_steps_count',
  'inspection_characteristics',
];
const portRows = cleanPorts.map((p) => [
  p.id,
  p.iataCode,
  p.city,
  p.airportName,
  p.terminal,
  p.chineseName,
  p.stepsCount,
  p.inspectionCharacteristics,
]);
fs.writeFileSync(
  'dataset/china_airport_med_clearance_ports.csv',
  [portHeader, ...portRows].map((r) => r.map(csvEscape).join(',')).join('\n') + '\n',
  'utf8',
);

fs.writeFileSync(
  'dataset/china_customs_medications_2026_2027.json',
  JSON.stringify(
    {
      schemaVersion: '2026.1',
      source: 'ChinaMedsCheck.com (compiled from GACC Decree 43, State Council Decree 442 & NMPA Psychotropic/Narcotic Catalogs)',
      disclaimer:
        'Educational regulatory reference only; does not constitute clinical medical advice or formal legal representation.',
      medications: cleanMeds,
      airportClearancePorts: cleanPorts,
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

console.log('Generated data.ts & datasets:', cleanMeds.length, 'meds,', cleanPorts.length, 'ports');
