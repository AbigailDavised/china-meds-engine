import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import {
  getAllMedications,
  getAirportPortProfiles,
  searchMedications,
  evaluateCustomsAllowance,
  evaluateTravelBagManifest,
  formatBilingualPharmacyCard,
} from '../dist/esm/index.js';

const require = createRequire(import.meta.url);
const cjs = require('../dist/cjs/index.cjs');

test('catalog loads 38 medications and 4 airport clearance profiles', () => {
  assert.equal(getAllMedications().length, 38);
  assert.equal(getAirportPortProfiles().length, 4);
});

test('searchMedications matches brand, generic, and Chinese names', () => {
  const ibu = searchMedications('advil');
  assert.ok(ibu.length >= 1);
  assert.equal(ibu[0].slug, 'ibuprofen-in-china');

  const adderall = searchMedications('adderall');
  assert.equal(adderall[0].category, 'BANNED');
});

test('evaluateCustomsAllowance handles BANNED, CONTROLLED, and ALLOWED tiers', () => {
  const banned = evaluateCustomsAllowance({
    medicationSlug: 'adderall-in-china',
    stayDurationDays: 10,
    carriedSupplyDays: 10,
  });
  assert.equal(banned.verdict, 'FORBIDDEN');
  assert.equal(banned.channel, 'STRICTLY_FORBIDDEN');

  const cat1Ok = evaluateCustomsAllowance({
    medicationSlug: 'ritalin-concerta-in-china',
    stayDurationDays: 14,
    carriedSupplyDays: 7,
  });
  assert.equal(cat1Ok.verdict, 'COMPLIANT');
  assert.equal(cat1Ok.channel, 'RED_CHANNEL');
  assert.equal(cat1Ok.requiresLocalHospitalRefill, true);

  const otcOk = evaluateCustomsAllowance({
    medicationSlug: 'ibuprofen-in-china',
    stayDurationDays: 14,
    carriedSupplyDays: 14,
  });
  assert.equal(otcOk.verdict, 'COMPLIANT');
  assert.equal(otcOk.channel, 'GREEN_CHANNEL');
});

test('evaluateTravelBagManifest escalates overall channel accurately', () => {
  const bagRed = evaluateTravelBagManifest(
    [
      { medicationSlug: 'ibuprofen-in-china', carriedSupplyDays: 10 },
      { medicationSlug: 'ritalin-concerta-in-china', carriedSupplyDays: 7 },
    ],
    10,
  );
  assert.equal(bagRed.overallChannel, 'RED_CHANNEL');
  assert.equal(bagRed.hasForbiddenItems, false);

  const bagForbidden = evaluateTravelBagManifest(
    [
      { medicationSlug: 'ibuprofen-in-china', carriedSupplyDays: 10 },
      { medicationSlug: 'cbd-oil-in-china', carriedSupplyDays: 5 },
    ],
    10,
  );
  assert.equal(bagForbidden.overallChannel, 'STRICTLY_FORBIDDEN');
  assert.equal(bagForbidden.hasForbiddenItems, true);
});

test('formatBilingualPharmacyCard and CJS parity', () => {
  const card = formatBilingualPharmacyCard('ibuprofen-in-china');
  assert.ok(card && card.includes('Generic'));
  assert.equal(typeof cjs.evaluateCustomsAllowance, 'function');
  assert.equal(cjs.getAllMedications().length, 38);
});
