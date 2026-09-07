import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LoginForm } from "@/components/LoginForm";
import { AdminClient } from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="font-serif text-3xl">Admin</h1>
        <LoginForm />
      </div>
    );
  }
  if (user.role !== "admin") {
    return (
      <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
        Admin only. Sign in as the ADMIN_EMAIL (default joe@example.com).
      </p>
    );
  }

  const pending = await prisma.lodging.findMany({
    where: { status: "pending_score" },
    include: { destination: { select: { shortName: true } } },
    orderBy: { createdAt: "desc" },
  });
  const settings = await prisma.tripSettings.findUnique({ where: { id: 1 } });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-serif text-3xl text-amber-950">Admin</h1>
      <AdminClient pending={pending} settings={settings} />
    </div>
  );
}
