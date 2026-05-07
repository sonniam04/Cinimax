"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import TrailerModal from "./TrailerModal";
import RatingWidget from "@/components/interactions/RatingWidget";
import LikeButton from "@/components/interactions/LikeButton";
import CommentList from "@/components/comments/CommentList";
import type { TMDBMovieDetail } from "@/types/tmdb";

interface MovieDetailClientProps {
  movie: TMDBMovieDetail;
}

export default function MovieDetailClient({ movie }: MovieDetailClientProps) {
  const t = useTranslations("movie");
  const [trailerOpen, setTrailerOpen] = useState(false);

  const trailer = movie.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const cast = movie.credits?.cast?.slice(0, 12) ?? [];

  return (
    <div>
      {/* Trailer button */}
      <div className="flex flex-wrap gap-3 mb-8">
        {trailer ? (
          <button
            onClick={() => setTrailerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-cinema-red hover:bg-cinema-red/90 text-white rounded-full text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            {t("trailer")}
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">{t("noTrailer")}</span>
        )}
        <LikeButton movieId={String(movie.id)} />
      </div>

      {/* Rating */}
      <div className="mb-8 p-4 bg-surface rounded-xl border border-border">
        <p className="text-sm text-muted-foreground mb-3">{t("rateThis")}</p>
        <RatingWidget movieId={String(movie.id)} />
      </div>

      {/* Additional info */}
      {director && (
        <div className="mb-6 flex gap-2 text-sm">
          <span className="text-muted-foreground">{t("director")}:</span>
          <span className="font-medium">{director.name}</span>
        </div>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">{t("cast")}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {cast.map((member) => (
              <div key={member.id} className="shrink-0">
                <div className="flex flex-col items-center gap-2 text-center w-20">
                  <div
                    className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-raised"
                    style={{ flexShrink: 0 }}
                  >
                    {member.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-muted-foreground">
                        {member.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium line-clamp-2">{member.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{member.character}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <div className="border-t border-border pt-8">
        <CommentList movieId={String(movie.id)} />
      </div>

      {/* Trailer Modal */}
      {trailerOpen && trailer && (
        <TrailerModal videoKey={trailer.key} onClose={() => setTrailerOpen(false)} />
      )}
    </div>
  );
}
