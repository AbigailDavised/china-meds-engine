export type MedicationCategory = 'BANNED' | 'CONTROLLED' | 'ALLOWED';
export type MedicationStatus = 'RED' | 'YELLOW' | 'GREEN';
export type CustomsChannel = 'RED_CHANNEL' | 'GREEN_CHANNEL' | 'STRICTLY_FORBIDDEN';
export type DrugClassification =
  | 'BANNED'
  | 'CONTROLLED_CAT1'
  | 'CONTROLLED_CAT2'
  | 'MAINTENANCE_RX'
  | 'OTC';
export type ClearanceVerdictStatus = 'FORBIDDEN' | 'COMPLIANT' | 'WARNING' | 'HIGH_RISK';

export interface MedicationRecord {
  slug: string;
  brandNames: string[];
  genericName: string;
  chineseName: string;
  pinyin?: string;
  pharmacyShowName?: string;
  category: MedicationCategory;
  status: MedicationStatus;
  allowanceDaysMax: number;
  channel: CustomsChannel;
  legalBasis: string;
  declarationRequirement: string;
  localAlternative: string;
  chinaOtcBrands: string[];
  indications: string[];
  casNumber?: string;
  incbCategory?: string;
  rxnormCui?: string;
  redLineWarning: boolean;
  caacCarryOn?: string;
  coldChain?: boolean;
  refillableInChina?: boolean;
  hospitalTier?: string;
}

export interface AirportPortProfile {
  id: string;
  iataCode: string;
  city: string;
  airportName: string;
  terminal: string;
  chineseName: string;
  inspectionCharacteristics: string;
  stepsCount: number;
}

export interface AllowanceEvaluation {
  classification: DrugClassification;
  verdict: ClearanceVerdictStatus;
  channel: CustomsChannel;
  maxRecommendedDays: number;
  carriedSupplyDays: number;
  stayDurationDays: number;
  requiresDoctorCertificate: boolean;
  requiresLocalHospitalRefill: boolean;
  summaryAdvice: string;
}

export interface BagManifestEvaluation {
  itemCount: number;
  overallChannel: CustomsChannel;
  hasForbiddenItems: boolean;
  hasRedChannelItems: boolean;
  items: {
    slugOrName: string;
    verdict: ClearanceVerdictStatus;
    channel: CustomsChannel;
    advice: string;
  }[];
}
