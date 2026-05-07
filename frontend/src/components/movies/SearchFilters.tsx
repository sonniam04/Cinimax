"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { TMDBGenre } from "@/types/tmdb";

interface SearchFiltersProps {
  genres: TMDBGenre[];
  currentQuery: string;
}

const SORT_OPTIONS = [
  { value: "popularity", labelKey: "popularity" },
  { value: "vote_average", labelKey: "rating" },
  { value: "release_date", labelKey: "releaseDate" },
] as const;

export default function SearchFilters({ genres, currentQuery }: SearchFiltersProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", currentQuery);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }

  const activeGenre = searchParams.get("genre") ?? "";
  const activeSort = searchParams.get("sort") ?? "";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium mb-2">{t("sortBy")}</p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("sort", activeSort === opt.value ? "" : opt.value)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeSort === opt.value
                  ? "bg-cinema-red/10 text-cinema-red"
                  : "hover:bg-surface-raised text-muted-foreground"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">{t("filterByGenre")}</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => updateParam("genre", "")}
            className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !activeGenre
                ? "bg-cinema-red/10 text-cinema-red"
                : "hover:bg-surface-raised text-muted-foreground"
            }`}
          >
            {t("allGenres")}
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => updateParam("genre", activeGenre === String(genre.id) ? "" : String(genre.id))}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeGenre === String(genre.id)
                  ? "bg-cinema-red/10 text-cinema-red"
                  : "hover:bg-surface-raised text-muted-foreground"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
