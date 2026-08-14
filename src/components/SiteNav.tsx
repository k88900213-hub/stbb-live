"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { book } from "@/lib/content/catalog";
import { cn } from "@/lib/utils/cn";
import {
  ArrowRight,
  BrainCircuit,
  Home,
  LibraryBig,
  Menu,
  ScanText,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Home", icon: <Home className="h-4 w-4" />, match: (p: string) => p === "/" },
  { href: "/stbb", label: "STBB Library", icon: <LibraryBig className="h-4 w-4" />, match: (p: string) => p.startsWith("/stbb") },
  { href: "/import", label: "Import Studio", icon: <ScanText className="h-4 w-4" />, match: (p: string) => p.startsWith("/import") },
];

function isReaderRoute(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "read" || (segments[0] === "stbb" && segments.length >= 3);
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (isReaderRoute(pathname)) return null;

  const entryHref = `/read/${book.chapters[0].slug}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#120c08]/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-sm font-bold text-foreground">Neural Sync</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-widest text-foreground/45 sm:block">
              Live Textbook
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                link.match(pathname)
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow shadow-orange-500/30"
                  : "text-foreground/65 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10",
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={entryHref}
            className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 sm:inline-flex"
          >
            Enter the Live Textbook
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-foreground/60 transition hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/40 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#14100c]/90 md:hidden">
          <nav className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  link.match(pathname)
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow shadow-orange-500/30"
                    : "text-foreground/70 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10",
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Link
              href={entryHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30"
            >
              Enter the Live Textbook
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
