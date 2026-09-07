import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LodgingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const lodging = await prisma.lodging.findUnique({
    where: { id },
    include: { destination: true },
  });
  if (!lodging) notFound();

  const isOwner = user && lodging.submitterId === user.id;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/destinations/${lodging.destination.slug}`}
        className="text-xs text-teal-800 hover:underline"
      >
        ← {lodging.destination.shortName}
      </Link>
      <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl text-amber-950">{lodging.title}</h1>
        <p className="mt-1 text-sm text-amber-800/70">
          {lodging.destination.name} · {lodging.source}
        </p>
        <a
          href={lodging.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-teal-800 underline"
        >
          Open listing
        </a>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl bg-amber-50 p-3">
            <dt className="text-xs text-amber-800/60">Bedrooms</dt>
            <dd className="text-lg font-semibold">{lodging.bedrooms}</dd>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <dt className="text-xs text-amber-800/60">Baths</dt>
            <dd className="text-lg font-semibold">{lodging.bathrooms ?? "—"}</dd>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <dt className="text-xs text-amber-800/60">Sleeps</dt>
            <dd className="text-lg font-semibold">{lodging.sleeps}</dd>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <dt className="text-xs text-amber-800/60">Property score</dt>
            <dd className="text-lg font-semibold">{lodging.lodgingScore ?? "—"}</dd>
          </div>
        </dl>

        <ul className="mt-4 flex flex-wrap gap-2 text-xs">
          {lodging.qualifies ? (
            <li className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">Qualifies (≥7 BR, 14+)</li>
          ) : (
            <li className="rounded-full bg-red-100 px-3 py-1 text-red-900">Does not qualify</li>
          )}
          {lodging.finalized && (
            <li className="rounded-full bg-teal-100 px-3 py-1 text-teal-900">On ballot</li>
          )}
          {lodging.hasPool && <li className="rounded-full bg-sky-50 px-3 py-1">Pool</li>}
          {lodging.hasGameRoom && <li className="rounded-full bg-sky-50 px-3 py-1">Game room</li>}
          {lodging.hasTheater && <li className="rounded-full bg-sky-50 px-3 py-1">Theater</li>}
          {lodging.realBedroomsConfirmed && (
            <li className="rounded-full bg-sky-50 px-3 py-1">Beds confirmed</li>
          )}
          {lodging.zeroMargin && (
            <li className="rounded-full bg-amber-100 px-3 py-1 text-amber-950">Zero margin sleeps</li>
          )}
        </ul>

        {lodging.notes && (
          <p className="mt-4 text-sm leading-relaxed text-amber-900/85">{lodging.notes}</p>
        )}

        {isOwner && (
          <p className="mt-4 text-xs text-amber-800/50">
            You submitted this (only visible on your My stuff view).
          </p>
        )}
      </div>
    </div>
  );
}
