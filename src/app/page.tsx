import Link from "next/link";
import { prisma } from "@/lib/db";
import { MapLoader } from "@/components/MapLoader";
import { parseJson } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [destinations, lodgings, settings] = await Promise.all([
    prisma.destination.findMany({ orderBy: [{ sortOrder: "asc" }, { totalScore: "desc" }] }),
    prisma.lodging.findMany({
      select: {
        id: true,
        title: true,
        lat: true,
        lng: true,
        bedrooms: true,
        qualifies: true,
        finalized: true,
        destination: { select: { slug: true, shortName: true } },
      },
    }),
    prisma.tripSettings.findUnique({ where: { id: 1 } }),
  ]);

  const top = destinations.filter((d) => d.status === "ballot_eligible");
  const research = destinations.filter((d) => d.status === "research");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 px-6 py-8 text-teal-50 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Family trip planning</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">June 2027 vacation vote</h1>
        <p className="mt-3 max-w-2xl text-sm text-teal-100/90">
          14 people · kids 11, 8, 4, 2 · book lodging by{" "}
          <strong>{settings?.bookBy || "2026-09-30"}</strong>. Votes are ranked{" "}
          <em>lodgings</em> (Borda). Destinations with zero qualifying homes are gated. Public cards
          never show who submitted.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-white/10 px-3 py-1">
            Primary: {settings?.primaryStart} → {settings?.primaryEnd}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Backup: {settings?.backupStart} → {settings?.backupEnd}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Voting {settings?.votingOpen ? "open" : "closed"}
          </span>
        </div>
      </section>

      <MapLoader
        destinations={destinations.map((d) => ({
          id: d.id,
          slug: d.slug,
          shortName: d.shortName,
          name: d.name,
          lat: d.lat,
          lng: d.lng,
          totalScore: d.totalScore,
          status: d.status,
          lodgingFeasibility: d.lodgingFeasibility,
        }))}
        lodgings={lodgings}
      />

      <section>
        <h2 className="font-serif text-2xl text-amber-950">Claude top destinations</h2>
        <p className="mt-1 text-sm text-amber-800/70">Exact packet scores · lodging feasibility is a gate</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {top.map((d) => (
            <Link
              key={d.id}
              href={`/destinations/${d.slug}`}
              className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition hover:border-teal-600"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-serif text-lg text-amber-950">{d.shortName}</div>
                  <div className="text-xs text-amber-800/70">{d.state} · {d.status.replace("_", " ")}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-teal-800">{d.totalScore}</div>
                  <div className="text-[10px] uppercase text-amber-800/50">/100</div>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-amber-900/80">{d.summary}</p>
              {d.callout && (
                <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900">
                  {d.callout}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-amber-950">Research / explore</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {research.map((d) => (
            <Link
              key={d.id}
              href={`/destinations/${d.slug}`}
              className="rounded-2xl border border-dashed border-amber-200 bg-[#fffdf8] p-4 hover:border-teal-600"
            >
              <div className="flex justify-between">
                <span className="font-medium text-amber-950">{d.shortName}</span>
                <span className="text-teal-800">{d.totalScore}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-amber-800/70">{d.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-100 bg-white p-4 text-sm text-amber-900/80">
        <h3 className="font-medium text-amber-950">Travel difficulty by origin (1=easy, 10=hard)</h3>
        <p className="mt-1 text-xs">
          Origins: Gig Harbor WA · Florida · Nashville · Rockford IL · Janesville WI — shown on each
          destination page (never used as public submitter labels).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {top.slice(0, 4).map((d) => {
            const td = parseJson<Record<string, number>>(d.travelDifficulty, {});
            return (
              <div key={d.id} className="rounded-lg bg-amber-50 px-3 py-2 text-xs">
                <div className="font-semibold">{d.shortName}</div>
                <div>SEA {td.gig_harbor_wa ?? "?"} · FL {td.florida ?? "?"} · BNA {td.nashville ?? "?"}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
