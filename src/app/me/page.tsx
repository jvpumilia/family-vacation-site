import { prisma } from "@/lib/db";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { FinalizePicker } from "@/components/FinalizePicker";
import { householdLabel } from "@/lib/households";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/me");
}

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="font-serif text-3xl text-amber-950">My stuff</h1>
        <LoginForm />
      </div>
    );
  }

  const lodgings = await prisma.lodging.findMany({
    where: { submitterId: user.id },
    orderBy: { createdAt: "desc" },
    include: { destination: { select: { shortName: true, slug: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-amber-950">My stuff</h1>
          <p className="mt-1 text-sm text-amber-800/70">
            {user.name} · {user.email} · {householdLabel(user.household)}
            {user.role === "admin" ? " · admin" : ""}
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-xs text-amber-800 underline">
            Sign out
          </button>
        </form>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl text-amber-950">Finalize 2 for ballot</h2>
        <FinalizePicker
          items={lodgings.map((l) => ({
            id: l.id,
            title: l.title,
            qualifies: l.qualifies,
            finalized: l.finalized,
            bedrooms: l.bedrooms,
          }))}
        />
      </section>

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl text-amber-950">My submissions</h2>
        <p className="mb-3 text-xs text-amber-800/60">
          Household label only shown here — not on public map/ballot cards.
        </p>
        <ul className="space-y-2">
          {lodgings.map((l) => (
            <li key={l.id}>
              <Link href={`/lodgings/${l.id}`} className="block rounded-xl border border-amber-50 px-3 py-2 hover:border-teal-600">
                <div className="font-medium text-amber-950">{l.title}</div>
                <div className="text-xs text-amber-800/70">
                  {l.destination.shortName} · {l.status} · {l.finalized ? "finalized" : "draft"}
                </div>
              </Link>
            </li>
          ))}
          {!lodgings.length && (
            <p className="text-sm text-amber-800/70">
              None yet. <Link href="/submit" className="underline">Submit a lodging</Link>
            </p>
          )}
        </ul>
      </section>
    </div>
  );
}
