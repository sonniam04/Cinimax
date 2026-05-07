const BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY ?? "";

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const getTrending = (tw: "day" | "week" = "week") =>
  tmdbFetch<any>(`/trending/movie/${tw}`);

export const getNowPlaying = () =>
  tmdbFetch<any>("/movie/now_playing");

export const getTopRated = () =>
  tmdbFetch<any>("/movie/top_rated");

export const getMovieDetail = (id: string) =>
  tmdbFetch<any>(`/movie/${id}`, {
    append_to_response: "credits,videos,similar",
  });

export const searchMovies = (query: string, page = 1) =>
  tmdbFetch<any>("/search/movie", {
    query,
    page: String(page),
    include_adult: "false",
  });

export const getGenres = () =>
  tmdbFetch<any>("/genre/movie/list");

export const getRecommendations = (id: string) =>
  tmdbFetch<any>(`/movie/${id}/recommendations`);
