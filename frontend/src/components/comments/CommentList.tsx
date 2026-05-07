"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CommentForm, { type CommentData } from "./CommentForm";
import CommentItem from "./CommentItem";
import { MessageSquare } from "lucide-react";

interface CommentListProps {
  movieId: string;
}

export default function CommentList({ movieId }: CommentListProps) {
  const t = useTranslations("comments");
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/comments?movieId=${movieId}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments ?? []);
        setLoading(false);
      });
  }, [movieId]);

  function handlePosted(comment: CommentData) {
    setComments((prev) => [comment, ...prev]);
  }

  function handleDeleted(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  function handleUpdated(updated: CommentData) {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-cinema-red" />
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        {!loading && (
          <span className="text-sm text-muted-foreground">({comments.length})</span>
        )}
      </div>

      <div className="mb-6">
        <CommentForm movieId={movieId} onPosted={handlePosted} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 py-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface-raised shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-raised rounded w-24" />
                <div className="h-3 bg-surface-raised rounded w-full" />
                <div className="h-3 bg-surface-raised rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">{t("noComments")}</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </section>
  );
}
