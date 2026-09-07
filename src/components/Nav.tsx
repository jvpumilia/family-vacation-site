import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function Nav() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/60 bg-[#fffaf3]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-serif text-lg font-semibold text-amber-950">
          Family Vacation <span className="text-teal-700">2027</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-amber-900/80">
          <Link href="/" className="hover:text-teal-800">
            Map
          </Link>
          <Link href="/submit" className="hover:text-teal-800">
            Submit
          </Link>
          <Link href="/vote" className="hover:text-teal-800">
            Vote
          </Link>
          <Link href="/me" className="hover:text-teal-800">
            My stuff
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="hover:text-teal-800">
              Admin
            </Link>
          )}
          {user ? (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-900">
              {user.name || user.email}
            </span>
          ) : (
            <Link
              href="/me"
              className="rounded-full bg-teal-700 px-3 py-1 text-xs text-white hover:bg-teal-800"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
