import type { TMDBMovie, TMDBMovieDetail } from "@/types/tmdb";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function getHomeMovies(): Promise<{
  trending: TMDBMovie[];
  topRated: TMDBMovie[];
  nowPlaying: TMDBMovie[];
}> {
  const res = await fetch(`${BACKEND}/tmdb/trending`, { next: { revalidate: 3600 } });
  if (!res.ok) return { trending: [], topRated: [], nowPlaying: [] };
  return res.json();
}

export async function getMovieDetail(id: string): Promise<TMDBMovieDetail> {
  const res = await fetch(`${BACKEND}/tmdb/movies/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Movie not found");
  return res.json();
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<{ results: TMDBMovie[]; total_results: number; total_pages: number; page: number }> {
  const res = await fetch(
    `${BACKEND}/tmdb/search?q=${encodeURIComponent(query)}&page=${page}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return { results: [], total_results: 0, total_pages: 0, page: 1 };
  return res.json();
}

export async function getGenres(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${BACKEND}/tmdb/genres`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres ?? [];
}
