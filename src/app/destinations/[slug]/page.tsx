import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScoreBars } from "@/components/ScoreBars";
import { parseJson } from "@/lib/format";
import { HOUSEHOLDS } from "@/lib/households";

export const dynamic = "force-dynamic";

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = await prisma.destination.findUnique({
    where: { slug },
    include: {
      lodgings: { orderBy: [{ finalized: "desc" }, { lodgingScore: "desc" }] },
      attractions: { orderBy: { name: "asc" } },
    },
  });
  if (!dest) notFound();

  const travel = parseJson<Record<string, number>>(dest.travelDifficulty, {});
  const airports = parseJson<string[]>(dest.airports, []);
  const qualifyingFinal = dest.lodgings.filter((l) => l.qualifies && l.finalized);
  const gated = qualifyingFinal.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-xs text-teal-800 hover:underline">
          ← Map
        </Link>
        <h1 className="mt-2 font-serif text-3xl text-amber-950">{dest.name}</h1>
        <p className="text-sm text-amber-800/70">
          {dest.status.replace("_", " ")} · airports {airports.join(", ")}
        </p>
        {dest.callout && (
          <p className="mt-3 rounded-xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-950">
            {dest.callout}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <ScoreBars
            scores={{
              lodgingFeasibility: dest.lodgingFeasibility,
              onSiteAmenities: dest.onSiteAmenities,
              travelBurden: dest.travelBurden,
              kidActivities: dest.kidActivities,
              natureNp: dest.natureNp,
              overflow: dest.overflow,
              juneCost: dest.juneCost,
              totalScore: dest.totalScore,
              disqualified: dest.disqualified,
            }}
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl text-amber-950">Overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/85">{dest.summary}</p>
            {dest.seaPattern && (
              <p className="mt-3 text-xs text-amber-800/70">
                <strong>SEA pattern:</strong> {dest.seaPattern}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl text-amber-950">Travel difficulty by origin</h2>
            <p className="text-xs text-amber-800/60">1 = easiest · 10 = hardest</p>
            <ul className="mt-3 space-y-2">
              {HOUSEHOLDS.filter((h) => h.id !== "other").map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span>{h.label}</span>
                  <span className="font-semibold text-teal-800">{travel[h.id] ?? "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-xl text-amber-950">Lodgings</h2>
          {gated ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
              Vote-gated — no finalized qualifying lodging
            </span>
          ) : (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
              {qualifyingFinal.length} on ballot
            </span>
          )}
        </div>
        <ul className="mt-4 space-y-3">
          {dest.lodgings.map((l) => (
            <li key={l.id}>
              <Link
                href={`/lodgings/${l.id}`}
                className="block rounded-xl border border-amber-100 px-4 py-3 hover:border-teal-600"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-amber-950">{l.title}</div>
                  <div className="text-xs text-amber-800/70">
                    {l.bedrooms} BR · sleeps {l.sleeps} · score {l.lodgingScore ?? "—"}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                  {l.finalized && (
                    <span className="rounded bg-teal-100 px-2 py-0.5 text-teal-900">Finalized</span>
                  )}
                  {l.qualifies ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800">Qualifies</span>
                  ) : (
                    <span className="rounded bg-red-50 px-2 py-0.5 text-red-800">Fails gate</span>
                  )}
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-900">{l.status}</span>
                  {/* never show submitter */}
                </div>
              </Link>
            </li>
          ))}
          {!dest.lodgings.length && (
            <p className="text-sm text-amber-800/70">No lodgings yet — submit one.</p>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl text-amber-950">Attractions (age bands)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs uppercase text-amber-800/60">
              <tr>
                <th className="pb-2">Attraction</th>
                <th>2–4</th>
                <th>4–8</th>
                <th>8–11</th>
                <th>Rain?</th>
              </tr>
            </thead>
            <tbody>
              {dest.attractions.map((a) => (
                <tr key={a.id} className="border-t border-amber-50">
                  <td className="py-2">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-amber-800/60">{a.description}</div>
                  </td>
                  <td>{a.age2to4}/5</td>
                  <td>{a.age4to8}/5</td>
                  <td>{a.age8to11}/5</td>
                  <td>{a.rainyDay ? "Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
