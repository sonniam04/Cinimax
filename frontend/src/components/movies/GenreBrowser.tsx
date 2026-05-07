"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl, formatYear } from "@/lib/utils";
import { Loader2, Star } from "lucide-react";
import type { TMDBGenre, TMDBMovie } from "@/types/tmdb";

interface GenreBrowserProps {
  genres: TMDBGenre[];
}

export default function GenreBrowser({ genres }: GenreBrowserProps) {
  const t = useTranslations("home");
  const [selectedGenre, setSelectedGenre] = useState<TMDBGenre | null>(null);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedGenre) { setMovies([]); return; }
    setLoading(true);
    fetch(`/api/tmdb/discover?genreId=${selectedGenre.id}`)
      .then((r) => r.json())
      .then((data) => setMovies(data.results ?? []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [selectedGenre]);

  return (
    <section>
      {/* Section title */}
      <h2 className="text-xl font-semibold mb-4">{t("browseByGenre")}</h2>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
            !selectedGenre
              ? "bg-cinema-red border-cinema-red text-white"
              : "bg-surface-raised border-border text-muted-foreground hover:border-cinema-red/50 hover:text-foreground"
          }`}
        >
          {t("allCategories")}
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(selectedGenre?.id === genre.id ? null : genre)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              selectedGenre?.id === genre.id
                ? "bg-cinema-red border-cinema-red text-white"
                : "bg-surface-raised border-border text-muted-foreground hover:border-cinema-red/50 hover:text-foreground"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {selectedGenre && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-cinema-red" />
            </div>
          ) : movies.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">{t("noMovies")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.slice(0, 18).map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group flex flex-col gap-2"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border group-hover:border-cinema-red/60 transition-all duration-200 group-hover:scale-[1.02]">
                    <Image
                      src={tmdbImageUrl(movie.poster_path, "w342")}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-gold text-gold" />
                        <span className="text-xs text-gold font-semibold">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium line-clamp-2 leading-snug">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">{formatYear(movie.release_date)}</p>
                </Link>
              ))}
            </div>
          )}

          {/* See more link */}
          {!loading && movies.length > 0 && (
            <div className="text-center mt-6">
              <Link
                href={`/search?genre=${selectedGenre.id}&q=`}
                className="text-sm text-cinema-red hover:underline"
              >
                {t("seeMoreInGenre")} {selectedGenre.name} →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
