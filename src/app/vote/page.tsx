import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { VoteClient } from "@/components/VoteClient";
import { bordaPoints } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const user = await getCurrentUser();
  const ballot = await prisma.lodging.findMany({
    where: { finalized: true, qualifies: true },
    include: {
      destination: {
        select: {
          shortName: true,
          slug: true,
          lodgingFeasibility: true,
          disqualified: true,
        },
      },
      votes: true,
    },
    orderBy: { lodgingScore: "desc" },
  });

  const eligible = ballot.filter(
    (l) => !l.destination.disqualified && l.destination.lodgingFeasibility >= 10
  );

  const myVotes = user
    ? await prisma.vote.findMany({ where: { userId: user.id }, orderBy: { rank: "asc" } })
    : [];

  const optionCount = eligible.length;
  const standings = eligible
    .map((l) => ({
      id: l.id,
      title: l.title,
      destination: l.destination.shortName,
      points: l.votes.reduce((s, v) => s + bordaPoints(v.rank, optionCount), 0),
      votes: l.votes.length,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-amber-950">Vote</h1>
        <p className="mt-2 text-sm text-amber-800/75">
          Rank finalized qualifying lodgings (real bedrooms confirmed). Destinations with 0 qualifying
          lodging cannot receive votes. Aggregate uses Borda count.
        </p>
      </div>

      {!user ? (
        <LoginForm />
      ) : (
        <VoteClient
          ballot={eligible.map((l) => ({
            id: l.id,
            title: l.title,
            bedrooms: l.bedrooms,
            sleeps: l.sleeps,
            lodgingScore: l.lodgingScore,
            destination: l.destination,
          }))}
          initialOrder={myVotes.map((v) => v.lodgingId)}
        />
      )}

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl text-amber-950">Live standings</h2>
        <p className="text-xs text-amber-800/60">No voter names shown</p>
        <ol className="mt-3 space-y-2">
          {standings.map((s, i) => (
            <li key={s.id} className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
              <span>
                <strong className="mr-2 text-teal-800">#{i + 1}</strong>
                {s.title}
                <span className="text-amber-800/60"> · {s.destination}</span>
              </span>
              <span className="font-semibold">{s.points} pts</span>
            </li>
          ))}
          {!standings.length && (
            <p className="text-sm text-amber-800/70">No ballot options yet.</p>
          )}
        </ol>
      </section>
    </div>
  );
}
