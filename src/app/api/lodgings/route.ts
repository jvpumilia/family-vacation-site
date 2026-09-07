import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { lodgingQualifies, scoreLodging } from "@/lib/scoring";

const createSchema = z.object({
  destinationId: z.string(),
  title: z.string().min(2),
  url: z.string().url(),
  source: z.string().default("other"),
  bedrooms: z.number().int().min(1),
  bathrooms: z.number().optional(),
  sleeps: z.number().int().min(1),
  realBedroomsConfirmed: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasGameRoom: z.boolean().default(false),
  hasTheater: z.boolean().default(false),
  parkingSpaces: z.number().int().optional(),
  dualFridge: z.boolean().default(false),
  dualDishwasher: z.boolean().default(false),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  zeroMargin: z.boolean().default(false),
});

export async function GET() {
  const lodgings = await prisma.lodging.findMany({
    include: {
      destination: { select: { slug: true, shortName: true, name: true } },
    },
    orderBy: [{ finalized: "desc" }, { lodgingScore: "desc" }],
  });
  // Public: strip submitter
  const publicRows = lodgings.map((row) => { const { submitterId, ...rest } = row; void submitterId; return rest; });
  return NextResponse.json({ lodgings: publicRows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  try {
    const body = createSchema.parse(await req.json());
    const dest = await prisma.destination.findUnique({ where: { id: body.destinationId } });
    if (!dest) return NextResponse.json({ error: "Destination not found" }, { status: 404 });

    const fields = {
      bedrooms: body.bedrooms,
      sleeps: body.sleeps,
      realBedroomsConfirmed: body.realBedroomsConfirmed,
      hasPool: body.hasPool,
      hasGameRoom: body.hasGameRoom,
      hasTheater: body.hasTheater,
      bathrooms: body.bathrooms,
      parkingSpaces: body.parkingSpaces,
      dualFridge: body.dualFridge,
      dualDishwasher: body.dualDishwasher,
      zeroMargin: body.zeroMargin,
    };
    const qualifies = lodgingQualifies(fields);
    const lodging = await prisma.lodging.create({
      data: {
        ...body,
        submitterId: user.id,
        status: "pending_score",
        qualifies,
        lodgingScore: scoreLodging(fields),
        lat: body.lat ?? dest.lat,
        lng: body.lng ?? dest.lng,
      },
    });
    const { submitterId, ...pub } = lodging; void submitterId;
    return NextResponse.json({ lodging: pub });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
