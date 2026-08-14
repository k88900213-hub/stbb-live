"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function Card({ item }: { item: FeatureItem }) {
  return (
    <div className="h-full rounded-2xl border border-white/40 bg-white/50 p-5 backdrop-blur transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25">
        {item.icon}
      </span>
      <h3 className="mt-3 text-sm font-bold text-foreground">{item.title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-foreground/60">{item.desc}</p>
    </div>
  );
}

export function FeatureCarousel({ items }: { items: FeatureItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [canScroll, setCanScroll] = useState(false);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const perView = Math.max(1, Math.round(el.clientWidth / card.offsetWidth));
    const count = Math.max(1, Math.ceil(items.length / perView));
    setPageCount(count);
    const current = Math.min(Math.round(el.scrollLeft / el.clientWidth), count - 1);
    setPage(current);
    setCanScroll(el.scrollWidth > el.clientWidth + 4);
  }, [items.length]);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(measure, 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [measure]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const goToPage = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        aria-label="AI features carousel"
      >
        {items.map((item, i) => (
          <div
            key={i}
            data-card
            className="w-full shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.666rem)]"
          >
            <Card item={item} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === page
                  ? "w-6 bg-gradient-to-r from-orange-500 to-amber-500"
                  : "w-2 bg-foreground/20 hover:bg-foreground/35",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByPage(-1)}
            disabled={!canScroll || page === 0}
            aria-label="Previous features"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/60 text-foreground/60 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollByPage(1)}
            disabled={!canScroll || page >= pageCount - 1}
            aria-label="Next features"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/60 text-foreground/60 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
