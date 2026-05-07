"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface CommentFormProps {
  movieId: string;
  onPosted: (comment: CommentData) => void;
}

export interface CommentData {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; image: string | null };
}

export default function CommentForm({ movieId, onPosted }: CommentFormProps) {
  const { user } = useAuth();
  const t = useTranslations("comments");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="p-4 rounded-xl bg-surface border border-border text-sm text-muted-foreground text-center">
        <Link href="/login" className="text-cinema-red hover:underline">
          {t("loginToComment")}
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbMovieId: movieId, body }),
    });

    if (res.ok) {
      const { comment } = await res.json();
      onPosted(comment);
      setBody("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("placeholder")}
        rows={3}
        className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl text-sm focus:outline-none focus:border-cinema-red transition-colors resize-none placeholder:text-muted-foreground"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="px-5 py-2 bg-cinema-red hover:bg-cinema-red/90 disabled:opacity-50 text-white text-sm font-medium rounded-full transition-colors"
        >
          {loading ? "..." : t("post")}
        </button>
      </div>
    </form>
  );
}
