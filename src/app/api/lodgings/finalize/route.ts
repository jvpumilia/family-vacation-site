import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { lodgingQualifies } from "@/lib/scoring";

const schema = z.object({
  lodgingIds: z.array(z.string()).length(2),
});

/** Finalize exactly 2 lodgings owned by the current user for the ballot */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  try {
    const { lodgingIds } = schema.parse(await req.json());
    const mine = await prisma.lodging.findMany({
      where: { id: { in: lodgingIds }, submitterId: user.id },
    });
    if (mine.length !== 2) {
      return NextResponse.json(
        { error: "Both lodgings must be yours. Submit more, then finalize exactly 2." },
        { status: 400 }
      );
    }
    for (const l of mine) {
      const ok =
        l.qualifies &&
        lodgingQualifies({
          bedrooms: l.bedrooms,
          sleeps: l.sleeps,
          realBedroomsConfirmed: l.realBedroomsConfirmed,
          hasPool: l.hasPool,
          hasGameRoom: l.hasGameRoom,
          hasTheater: l.hasTheater,
        });
      if (!ok) {
        return NextResponse.json(
          {
            error: `"${l.title}" does not qualify (≥7 real BR confirmed, sleeps 14+). Unconfirmed bedroom counts cannot be finalized.`,
          },
          { status: 400 }
        );
      }
    }
    await prisma.$transaction([
      prisma.lodging.updateMany({
        where: { submitterId: user.id },
        data: { finalized: false },
      }),
      prisma.lodging.updateMany({
        where: { id: { in: lodgingIds }, submitterId: user.id },
        data: { finalized: true, status: "scored" },
      }),
    ]);
    return NextResponse.json({ ok: true, finalized: lodgingIds });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Finalize failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
