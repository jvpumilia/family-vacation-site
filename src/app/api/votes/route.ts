import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { bordaPoints } from "@/lib/scoring";

const schema = z.object({
  lodgingIds: z.array(z.string()).min(1),
});

/** Ranked lodging preferences — Borda count. Destinations with 0 qualifying lodging are gated. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const settings = await prisma.tripSettings.findUnique({ where: { id: 1 } });
  if (settings && !settings.votingOpen) {
    return NextResponse.json({ error: "Voting is closed" }, { status: 403 });
  }

  try {
    const { lodgingIds } = schema.parse(await req.json());
    const unique = [...new Set(lodgingIds)];
    if (unique.length !== lodgingIds.length) {
      return NextResponse.json({ error: "Duplicate lodging in ranking" }, { status: 400 });
    }

    const lodgings = await prisma.lodging.findMany({
      where: { id: { in: lodgingIds }, finalized: true, qualifies: true },
      include: { destination: true },
    });
    if (lodgings.length !== lodgingIds.length) {
      return NextResponse.json(
        { error: "All ranked items must be finalized qualifying lodgings on the ballot" },
        { status: 400 }
      );
    }

    for (const l of lodgings) {
      if (l.destination.disqualified || l.destination.lodgingFeasibility < 10) {
        return NextResponse.json(
          { error: `${l.destination.shortName} is disqualified (lodging gate)` },
          { status: 400 }
        );
      }
      const eligibleCount = await prisma.lodging.count({
        where: {
          destinationId: l.destinationId,
          qualifies: true,
          finalized: true,
        },
      });
      if (eligibleCount < 1) {
        return NextResponse.json(
          { error: `${l.destination.shortName} has no qualifying lodging — gated` },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { userId: user.id } }),
      ...lodgingIds.map((lodgingId, i) =>
        prisma.vote.create({
          data: { userId: user.id, lodgingId, rank: i + 1 },
        })
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Vote failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  const myVotes = user
    ? await prisma.vote.findMany({
        where: { userId: user.id },
        orderBy: { rank: "asc" },
        include: { lodging: { select: { id: true, title: true } } },
      })
    : [];

  const ballot = await prisma.lodging.findMany({
    where: { finalized: true, qualifies: true },
    include: {
      destination: true,
      votes: true,
    },
  });

  // Gate: drop lodgings whose destination has 0 qualifying finalized
  const byDest = new Map<string, number>();
  for (const l of ballot) {
    byDest.set(l.destinationId, (byDest.get(l.destinationId) || 0) + 1);
  }

  const optionCount = ballot.filter((l) => (byDest.get(l.destinationId) || 0) > 0).length;
  const standings = ballot
    .filter((l) => !l.destination.disqualified && l.destination.lodgingFeasibility >= 10)
    .map((l) => {
      const points = l.votes.reduce((sum, v) => sum + bordaPoints(v.rank, optionCount), 0);
      return {
        lodgingId: l.id,
        title: l.title,
        destination: l.destination.shortName,
        destinationSlug: l.destination.slug,
        bedrooms: l.bedrooms,
        sleeps: l.sleeps,
        points,
        voteCount: l.votes.length,
      };
    })
    .sort((a, b) => b.points - a.points);

  return NextResponse.json({
    myVotes: myVotes.map((v) => ({
      rank: v.rank,
      lodgingId: v.lodgingId,
      title: v.lodging.title,
    })),
    standings,
    ballotSize: optionCount,
  });
}
