import { NextResponse } from "next/server";
import { z } from "zod";
import { loginWithEmail } from "@/lib/auth";
import { HOUSEHOLDS } from "@/lib/households";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  household: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    if (!HOUSEHOLDS.some((h) => h.id === body.household)) {
      return NextResponse.json({ error: "Invalid household" }, { status: 400 });
    }
    const user = await loginWithEmail(body);
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        household: user.household,
        role: user.role,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
