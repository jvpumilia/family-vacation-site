import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { lodgingQualifies, scoreLodging, totalDestinationScore } from "@/lib/scoring";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const pending = await prisma.lodging.findMany({
    where: { status: "pending_score" },
    include: { destination: { select: { shortName: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  const settings = await prisma.tripSettings.findUnique({ where: { id: 1 } });
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, household: true, role: true },
  });
  return NextResponse.json({ pending, settings, users });
}

const patchSchema = z.object({
  action: z.enum(["score_lodging", "update_settings", "set_voting", "update_destination"]),
  lodgingId: z.string().optional(),
  qualifies: z.boolean().optional(),
  status: z.string().optional(),
  scoreNotes: z.string().optional(),
  realBedroomsConfirmed: z.boolean().optional(),
  votingOpen: z.boolean().optional(),
  primaryStart: z.string().optional(),
  primaryEnd: z.string().optional(),
  backupStart: z.string().optional(),
  backupEnd: z.string().optional(),
  destinationId: z.string().optional(),
  lodgingFeasibility: z.number().optional(),
  onSiteAmenities: z.number().optional(),
  travelBurden: z.number().optional(),
  kidActivities: z.number().optional(),
  natureNp: z.number().optional(),
  overflow: z.number().optional(),
  juneCost: z.number().optional(),
});

export async function POST(req: Request) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = patchSchema.parse(await req.json());

  if (body.action === "score_lodging" && body.lodgingId) {
    const lodging = await prisma.lodging.findUnique({ where: { id: body.lodgingId } });
    if (!lodging) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const fields = {
      bedrooms: lodging.bedrooms,
      sleeps: lodging.sleeps,
      realBedroomsConfirmed: body.realBedroomsConfirmed ?? lodging.realBedroomsConfirmed,
      hasPool: lodging.hasPool,
      hasGameRoom: lodging.hasGameRoom,
      hasTheater: lodging.hasTheater,
      bathrooms: lodging.bathrooms,
      parkingSpaces: lodging.parkingSpaces,
      dualFridge: lodging.dualFridge,
      dualDishwasher: lodging.dualDishwasher,
      zeroMargin: lodging.zeroMargin,
    };
    const qualifies = body.qualifies ?? lodgingQualifies(fields);
    const updated = await prisma.lodging.update({
      where: { id: body.lodgingId },
      data: {
        status: body.status || "scored",
        qualifies,
        realBedroomsConfirmed: fields.realBedroomsConfirmed,
        scoreNotes: body.scoreNotes,
        lodgingScore: scoreLodging(fields),
      },
    });
    return NextResponse.json({ lodging: updated });
  }

  if (body.action === "set_voting") {
    const settings = await prisma.tripSettings.update({
      where: { id: 1 },
      data: { votingOpen: body.votingOpen ?? true },
    });
    return NextResponse.json({ settings });
  }

  if (body.action === "update_settings") {
    const settings = await prisma.tripSettings.update({
      where: { id: 1 },
      data: {
        primaryStart: body.primaryStart,
        primaryEnd: body.primaryEnd,
        backupStart: body.backupStart,
        backupEnd: body.backupEnd,
      },
    });
    return NextResponse.json({ settings });
  }

  if (body.action === "update_destination" && body.destinationId) {
    const scores = {
      lodgingFeasibility: body.lodgingFeasibility ?? 0,
      onSiteAmenities: body.onSiteAmenities ?? 0,
      travelBurden: body.travelBurden ?? 0,
      kidActivities: body.kidActivities ?? 0,
      natureNp: body.natureNp ?? 0,
      overflow: body.overflow ?? 0,
      juneCost: body.juneCost ?? 0,
    };
    const dest = await prisma.destination.update({
      where: { id: body.destinationId },
      data: {
        ...scores,
        totalScore: totalDestinationScore(scores),
        disqualified: scores.lodgingFeasibility < 10,
      },
    });
    return NextResponse.json({ destination: dest });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
