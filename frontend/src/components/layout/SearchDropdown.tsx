"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Search, Loader2, X } from "lucide-react";
import { tmdbImageUrl, formatYear } from "@/lib/utils";
import type { TMDBMovie } from "@/types/tmdb";

export default function SearchDropdown({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      setResults((data.results ?? []).slice(0, 6));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
      onClose?.();
    }
  }

  function goToMovie(id: number) {
    router.push(`/movies/${id}`);
    setOpen(false);
    setQuery("");
    onClose?.();
  }

  function goToSearch() {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery("");
    onClose?.();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-9 pr-8 py-2 rounded-full bg-surface-raised border border-border text-sm focus:outline-none focus:border-cinema-red transition-colors placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <X className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (results.length > 0 || loading) && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
          {results.map((movie) => (
            <button
              key={movie.id}
              onClick={() => goToMovie(movie.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-raised transition-colors text-left"
            >
              {/* Poster thumbnail */}
              <div className="relative w-9 h-14 rounded-md overflow-hidden shrink-0 bg-surface-raised">
                {movie.poster_path ? (
                  <Image
                    src={tmdbImageUrl(movie.poster_path, "w92")}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Search className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{movie.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatYear(movie.release_date)}
                  {movie.vote_average > 0 && (
                    <span className="ml-2 text-gold">★ {movie.vote_average.toFixed(1)}</span>
                  )}
                </p>
              </div>
            </button>
          ))}

          {/* See all footer */}
          <button
            onClick={goToSearch}
            className="w-full px-3 py-2.5 text-sm text-cinema-red hover:bg-surface-raised transition-colors text-center border-t border-border font-medium"
          >
            {t("seeAllResults")} &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
