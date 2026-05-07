"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import MovieCarousel from "./MovieCarousel";
import type { TMDBMovie } from "@/types/tmdb";

export default function RecommendationsCarousel() {
  const t = useTranslations("home");
  const [movies, setMovies] = useState<TMDBMovie[]>([]);

  useEffect(() => {
    fetch("/api/tmdb/recommendations")
      .then((r) => r.json())
      .then((data) => setMovies(data.movies ?? []));
  }, []);

  if (movies.length === 0) return null;

  return <MovieCarousel movies={movies} title={t("forYou")} />;
}
