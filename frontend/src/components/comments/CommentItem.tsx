"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { CommentData } from "./CommentForm";

interface CommentItemProps {
  comment: CommentData;
  onDeleted: (id: string) => void;
  onUpdated: (comment: CommentData) => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommentItem({ comment, onDeleted, onUpdated }: CommentItemProps) {
  const { user } = useAuth();
  const t = useTranslations("comments");
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.id === comment.user.id;

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    setLoading(true);
    await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    onDeleted(comment.id);
  }

  async function handleUpdate() {
    if (!editBody.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editBody }),
    });
    if (res.ok) {
      const { comment: updated } = await res.json();
      onUpdated(updated);
      setEditing(false);
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-cinema-red shrink-0 flex items-center justify-center text-xs font-semibold uppercase">
        {comment.user.name?.[0] ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.user.name ?? "User"}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:border-cinema-red resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-cinema-red text-white rounded-full hover:bg-cinema-red/90"
              >
                <Check className="w-3 h-3" /> Save
              </button>
              <button
                onClick={() => { setEditing(false); setEditBody(comment.body); }}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-surface-raised rounded-full"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{comment.body}</p>
        )}
      </div>
      {isOwner && !editing && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded hover:bg-surface-raised text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-1.5 rounded hover:bg-surface-raised text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
