"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { useRating } from "@/hooks/useRating";
import Link from "next/link";
import { X } from "lucide-react";

interface RatingWidgetProps {
  movieId: string;
}

export default function RatingWidget({ movieId }: RatingWidgetProps) {
  const { user } = useAuth();
  const t = useTranslations("rating");
  const { rating, setRating, removeRating, pending } = useRating(movieId);
  const [hovered, setHovered] = useState<number | null>(null);

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">
        <Link href="/login" className="text-cinema-red hover:underline">
          {t("loginToRate")}
        </Link>
      </div>
    );
  }

  const displayScore = hovered ?? rating;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-2">{t("yourRating")}:</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
          <button
            key={score}
            disabled={pending}
            onClick={() => setRating(score)}
            onMouseEnter={() => setHovered(score)}
            onMouseLeave={() => setHovered(null)}
            className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
              (displayScore ?? 0) >= score
                ? "bg-gold text-black"
                : "bg-surface-raised text-muted-foreground hover:bg-gold/30"
            }`}
          >
            {score}
          </button>
        ))}
        {rating && (
          <button
            onClick={removeRating}
            disabled={pending}
            className="ml-1 p-1 rounded hover:bg-surface-raised text-muted-foreground hover:text-foreground transition-colors"
            title={t("removeRating")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {rating && (
        <p className="text-xs text-muted-foreground">
          {t("yourRating")}: <span className="text-gold font-bold">{rating}</span> {t("scale")}
        </p>
      )}
    </div>
  );
}
