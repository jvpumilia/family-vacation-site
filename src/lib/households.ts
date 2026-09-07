export const HOUSEHOLDS = [
  { id: "gig_harbor_wa", label: "Gig Harbor / Seattle WA" },
  { id: "florida", label: "Florida" },
  { id: "nashville", label: "Nashville TN" },
  { id: "rockford_il", label: "Rockford IL" },
  { id: "janesville_wi", label: "Janesville WI" },
  { id: "other", label: "Other / Guest" },
] as const;

export type HouseholdId = (typeof HOUSEHOLDS)[number]["id"];

export function householdLabel(id: string) {
  return HOUSEHOLDS.find((h) => h.id === id)?.label ?? id;
}
