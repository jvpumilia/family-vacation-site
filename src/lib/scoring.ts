/** Claude rubric — 100 pts; lodging feasibility under 10 = DISQUALIFIED */
export const DESTINATION_CRITERIA = [
  { key: "lodgingFeasibility", label: "Lodging feasibility (GATE)", max: 25 },
  { key: "onSiteAmenities", label: "On-site kid amenities", max: 10 },
  { key: "travelBurden", label: "Travel burden", max: 20 },
  { key: "kidActivities", label: "Kid activities ages 2–11", max: 15 },
  { key: "natureNp", label: "Nature / national park", max: 15 },
  { key: "overflow", label: "Overflow lodging depth", max: 5 },
  { key: "juneCost", label: "June cost & conditions", max: 10 },
] as const;

export type DestinationScoreInput = {
  lodgingFeasibility: number;
  onSiteAmenities: number;
  travelBurden: number;
  kidActivities: number;
  natureNp: number;
  overflow: number;
  juneCost: number;
};

export function totalDestinationScore(s: DestinationScoreInput) {
  return (
    s.lodgingFeasibility +
    s.onSiteAmenities +
    s.travelBurden +
    s.kidActivities +
    s.natureNp +
    s.overflow +
    s.juneCost
  );
}

export function isDisqualified(lodgingFeasibility: number) {
  return lodgingFeasibility < 10;
}

export type LodgingFields = {
  bedrooms: number;
  sleeps: number;
  realBedroomsConfirmed: boolean;
  hasPool: boolean;
  hasGameRoom: boolean;
  hasTheater: boolean;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  dualFridge?: boolean;
  dualDishwasher?: boolean;
  zeroMargin?: boolean;
};

/** Hard gate: ≥7 real BR confirmed, sleeps 14+. Unconfirmed bedroom counts cannot qualify or be voted. */
export function lodgingQualifies(l: LodgingFields) {
  if (l.bedrooms < 7) return false;
  if (l.sleeps < 14) return false;
  if (!l.realBedroomsConfirmed) return false;
  return true;
}

/** Soft property score 0–100 for ranking among lodgings */
export function scoreLodging(l: LodgingFields): number {
  let score = 0;
  if (l.bedrooms >= 7) score += 25;
  else score += Math.max(0, l.bedrooms * 3);
  if (l.sleeps >= 14) score += 15;
  if (l.realBedroomsConfirmed) score += 10;
  if (l.hasPool) score += 15;
  if (l.hasGameRoom) score += 10;
  if (l.hasTheater) score += 8;
  if ((l.bathrooms ?? 0) >= 6) score += 8;
  else if ((l.bathrooms ?? 0) >= 5) score += 4;
  if ((l.parkingSpaces ?? 0) >= 3) score += 5;
  if (l.dualFridge) score += 2;
  if (l.dualDishwasher) score += 2;
  if (l.zeroMargin) score -= 8;
  return Math.max(0, Math.min(100, score));
}

/** Borda count: n options → 1st gets n pts, 2nd n-1, … */
export function bordaPoints(rank: number, optionCount: number) {
  return Math.max(0, optionCount - rank + 1);
}
