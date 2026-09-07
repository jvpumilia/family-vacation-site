import { DESTINATION_CRITERIA } from "@/lib/scoring";

type Scores = {
  lodgingFeasibility: number;
  onSiteAmenities: number;
  travelBurden: number;
  kidActivities: number;
  natureNp: number;
  overflow: number;
  juneCost: number;
  totalScore: number;
  disqualified?: boolean;
};

export function ScoreBars({ scores }: { scores: Scores }) {
  const map: Record<string, number> = {
    lodgingFeasibility: scores.lodgingFeasibility,
    onSiteAmenities: scores.onSiteAmenities,
    travelBurden: scores.travelBurden,
    kidActivities: scores.kidActivities,
    natureNp: scores.natureNp,
    overflow: scores.overflow,
    juneCost: scores.juneCost,
  };
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-800/70">Claude rubric</p>
          <p className="font-serif text-3xl font-semibold text-amber-950">
            {scores.totalScore}
            <span className="text-base font-normal text-amber-800/60"> / 100</span>
          </p>
        </div>
        {scores.disqualified || scores.lodgingFeasibility < 10 ? (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            DISQUALIFIED — lodging gate
          </span>
        ) : (
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900">
            Lodging gate OK
          </span>
        )}
      </div>
      {DESTINATION_CRITERIA.map((c) => {
        const val = map[c.key] ?? 0;
        const pct = Math.round((val / c.max) * 100);
        return (
          <div key={c.key}>
            <div className="mb-1 flex justify-between text-xs text-amber-900/80">
              <span>{c.label}</span>
              <span>
                {val}/{c.max}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-amber-100">
              <div
                className={`h-full rounded-full ${c.key === "lodgingFeasibility" && val < 10 ? "bg-red-500" : "bg-teal-600"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
