import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { tmdbImageUrl, formatYear } from "@/lib/utils";
import type { TMDBMovie } from "@/types/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
  userRating?: number | null;
}

export default function MovieCard({ movie, userRating }: MovieCardProps) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative flex flex-col bg-surface rounded-xl overflow-hidden border border-border hover:border-cinema-red/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cinema-red/10"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={tmdbImageUrl(movie.poster_path, "w342")}
          alt={movie.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
        />
        {/* Rating badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs">
          <Star className="w-3 h-3 fill-gold text-gold" />
          <span className="text-gold font-medium">{movie.vote_average.toFixed(1)}</span>
        </div>
        {/* User rating badge */}
        {userRating && (
          <div className="absolute top-2 right-2 bg-cinema-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {userRating}/10
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 leading-snug">{movie.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatYear(movie.release_date)}</p>
      </div>
    </Link>
  );
}
