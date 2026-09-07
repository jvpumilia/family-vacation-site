import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { SubmitForm } from "@/components/SubmitForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  const destinations = await prisma.destination.findMany({
    orderBy: [{ sortOrder: "asc" }],
    select: { id: true, shortName: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-amber-950">Submit lodging</h1>
        <p className="mt-2 text-sm text-amber-800/75">
          Paste an Airbnb/VRBO/manager URL, extract OG if possible, then confirm bedrooms. You can add
          many; later finalize exactly 2 for the ballot. Public cards never show your name.
        </p>
      </div>
      {!user ? <LoginForm /> : <SubmitForm destinations={destinations} />}
    </div>
  );
}
