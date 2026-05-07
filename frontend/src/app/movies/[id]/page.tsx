import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Star, Clock, Calendar, ChevronLeft } from "lucide-react";
import { getMovieDetail } from "@/lib/tmdb";
import { tmdbImageUrl, formatYear, formatRuntime, formatDate } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieCarousel from "@/components/movies/MovieCarousel";
import MovieDetailClient from "@/components/movies/MovieDetailClient";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(id);
    return {
      title: `${movie.title} — Cinemax`,
      description: movie.overview?.slice(0, 160),
      openGraph: {
        images: movie.backdrop_path
          ? [{ url: tmdbImageUrl(movie.backdrop_path, "w1280") }]
          : [],
      },
    };
  } catch {
    return { title: "Movie — Cinemax" };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const t = await getTranslations("movie");

  let movie;
  try {
    movie = await getMovieDetail(id);
  } catch {
    notFound();
  }

  const similar = movie.similar?.results?.slice(0, 12) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Backdrop */}
        <div className="relative w-full h-[50vh] min-h-[300px]">
          <Image
            src={tmdbImageUrl(movie.backdrop_path, "w1280")}
            alt={movie.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0">
              <div className="relative w-48 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-border">
                <Image
                  src={tmdbImageUrl(movie.poster_path, "w342")}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="224px"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genres?.map((g) => (
                  <span
                    key={g.id}
                    className="px-3 py-0.5 text-xs rounded-full bg-surface-raised border border-border text-muted-foreground"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-4xl md:text-5xl text-white leading-tight tracking-wide mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-muted-foreground italic mb-4">{movie.tagline}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="font-semibold text-gold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({movie.vote_count.toLocaleString()})</span>
                </div>
                {movie.runtime ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatRuntime(movie.runtime)}
                  </div>
                ) : null}
                {movie.release_date && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(movie.release_date)}
                  </div>
                )}
              </div>

              {/* Overview */}
              <p className="text-muted-foreground leading-relaxed mb-6">{movie.overview}</p>

              {/* Client interactions */}
              <MovieDetailClient movie={movie} />
            </div>
          </div>

          {/* Similar movies */}
          {similar.length > 0 && (
            <div className="mt-12">
              <MovieCarousel movies={similar} title={t("similar")} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
