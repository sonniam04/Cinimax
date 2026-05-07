import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { tmdbImageUrl, formatYear } from "@/lib/utils";
import type { TMDBMovie } from "@/types/tmdb";

interface MovieHeroProps {
  movie: TMDBMovie;
  watchTrailerLabel: string;
  moreInfoLabel: string;
}

export default function MovieHero({ movie, watchTrailerLabel, moreInfoLabel }: MovieHeroProps) {
  return (
    <div className="relative w-full h-[70vh] min-h-[420px] overflow-hidden rounded-none md:rounded-2xl">
      {/* Backdrop */}
      <Image
        src={tmdbImageUrl(movie.backdrop_path, "w1280")}
        alt={movie.title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 md:max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 fill-gold text-gold" />
          <span className="text-gold text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
          <span className="text-muted-foreground text-sm">• {formatYear(movie.release_date)}</span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl text-white mb-3 leading-tight tracking-wide">
          {movie.title}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base line-clamp-3 mb-6">
          {movie.overview}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/movies/${movie.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-cinema-red hover:bg-cinema-red/90 text-white rounded-full text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            {watchTrailerLabel}
          </Link>
          <Link
            href={`/movies/${movie.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium transition-colors border border-white/20"
          >
            <Info className="w-4 h-4" />
            {moreInfoLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
