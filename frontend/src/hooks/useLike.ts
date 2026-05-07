import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLike(movieId: string) {
  const { data, mutate } = useSWR<{ liked: boolean }>(
    `/api/likes?movieId=${movieId}`,
    fetcher
  );

  const [pending, setPending] = useState(false);

  async function toggleLike() {
    if (pending) return;
    const currentLiked = data?.liked ?? false;
    setPending(true);

    await mutate(
      async () => {
        const res = await fetch(
          currentLiked ? `/api/likes?movieId=${movieId}` : "/api/likes",
          {
            method: currentLiked ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: currentLiked ? undefined : JSON.stringify({ tmdbMovieId: movieId }),
          }
        );
        const json = await res.json();
        return { liked: json.liked };
      },
      { optimisticData: { liked: !currentLiked }, revalidate: false }
    );

    setPending(false);
  }

  return { liked: data?.liked ?? false, toggleLike, pending };
}
