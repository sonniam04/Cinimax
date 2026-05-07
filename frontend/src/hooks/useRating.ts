import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useRating(movieId: string) {
  const { data, mutate } = useSWR<{ rating: number | null }>(
    `/api/ratings?movieId=${movieId}`,
    fetcher
  );

  const [pending, setPending] = useState(false);

  async function setRating(score: number) {
    setPending(true);
    await mutate(
      async () => {
        const res = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbMovieId: movieId, score }),
        });
        const json = await res.json();
        return { rating: json.rating };
      },
      { optimisticData: { rating: score }, revalidate: false }
    );
    setPending(false);
  }

  async function removeRating() {
    setPending(true);
    await mutate(
      async () => {
        await fetch(`/api/ratings?movieId=${movieId}`, { method: "DELETE" });
        return { rating: null };
      },
      { optimisticData: { rating: null }, revalidate: false }
    );
    setPending(false);
  }

  return { rating: data?.rating ?? null, setRating, removeRating, pending };
}
