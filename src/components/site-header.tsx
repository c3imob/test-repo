"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/generate", label: "Generate" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" }
];

export function SiteHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          AI BlogCraft
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-zinc-400 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:text-white ${pathname?.startsWith(link.href) ? "text-white" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <>
              <span className="text-sm text-zinc-400">
                {session.user?.email} · {session.user?.role === "PRO" ? "Pro" : "Free"}
              </span>
              <button className="btn-primary" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => signIn()}>
              Sign in
            </button>
          )}
        </div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-zinc-700 p-2 text-zinc-200 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-zinc-800 px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-2 py-2 text-sm transition hover:bg-zinc-800/60 ${
                pathname?.startsWith(link.href) ? "bg-zinc-800/80 text-white" : "text-zinc-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            {session ? (
              <button
                className="btn-primary w-full"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </button>
            ) : (
              <button
                className="btn-primary w-full"
                onClick={() => {
                  setOpen(false);
                  signIn();
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
