"use client";

import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useLike } from "@/hooks/useLike";
import Link from "next/link";

interface LikeButtonProps {
  movieId: string;
}

export default function LikeButton({ movieId }: LikeButtonProps) {
  const { user } = useAuth();
  const t = useTranslations("movie");
  const { liked, toggleLike, pending } = useLike(movieId);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-raised border border-border text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <Heart className="w-4 h-4" />
        {t("addToFavorites")}
      </Link>
    );
  }

  return (
    <button
      onClick={toggleLike}
      disabled={pending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
        liked
          ? "bg-cinema-red/10 border-cinema-red text-cinema-red"
          : "bg-surface-raised border-border text-muted-foreground hover:text-foreground hover:border-cinema-red/50"
      }`}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-cinema-red" : ""}`} />
      {liked ? t("removeFromFavorites") : t("addToFavorites")}
    </button>
  );
}
