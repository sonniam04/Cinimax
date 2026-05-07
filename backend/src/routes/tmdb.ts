import { Hono } from "hono";
import {
  getTrending,
  getNowPlaying,
  getTopRated,
  getMovieDetail,
  searchMovies,
  getGenres,
  getRecommendations,
} from "../lib/tmdb.js";
import { prisma } from "../lib/prisma.js";
import { getCookie } from "hono/cookie";
import { verifyToken } from "../lib/jwt.js";

const tmdb = new Hono();

tmdb.get("/trending", async (c) => {
  const tw = (c.req.query("timeWindow") ?? "week") as "day" | "week";
  const [trending, topRated, nowPlaying] = await Promise.all([
    getTrending(tw),
    getTopRated(),
    getNowPlaying(),
  ]);
  return c.json({ trending: trending.results, topRated: topRated.results, nowPlaying: nowPlaying.results });
});

tmdb.get("/search", async (c) => {
  const query = c.req.query("q") ?? "";
  const page = parseInt(c.req.query("page") ?? "1");
  if (!query.trim()) return c.json({ results: [], total_results: 0, total_pages: 0, page: 1, genres: [] });

  const [data, genreData] = await Promise.all([searchMovies(query, page), getGenres()]);
  return c.json({ ...data, genres: genreData.genres });
});

tmdb.get("/genres", async (c) => {
  const data = await getGenres();
  return c.json({ genres: data.genres });
});

tmdb.get("/movies/:id", async (c) => {
  const id = c.req.param("id");
  const movie = await getMovieDetail(id);
  return c.json(movie);
});

tmdb.get("/recommendations", async (c) => {
  const token = getCookie(c, "token");
  if (!token) {
    const data = await getNowPlaying();
    return c.json({ movies: data.results });
  }

  const payload = verifyToken(token);
  if (!payload) {
    const data = await getNowPlaying();
    return c.json({ movies: data.results });
  }

  const [likes, ratings] = await Promise.all([
    prisma.like.findMany({ where: { userId: payload.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.rating.findMany({ where: { userId: payload.id, score: { gte: 7 } }, orderBy: { score: "desc" }, take: 3 }),
  ]);

  const seedIds = [...likes.map((l) => l.tmdbMovieId), ...ratings.map((r) => r.tmdbMovieId)].slice(0, 3);

  if (seedIds.length === 0) {
    const data = await getNowPlaying();
    return c.json({ movies: data.results });
  }

  const allRecs = await Promise.all(seedIds.map((id) => getRecommendations(id)));
  const seen = new Set<number>();
  const movies = allRecs
    .flat()
    .flatMap((r: any) => r.results ?? [])
    .filter((m: any) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
    .slice(0, 20);

  return c.json({ movies });
});

// Profile data endpoint - returns liked + rated movie IDs
tmdb.get("/profile", async (c) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const payload = verifyToken(token);
  if (!payload) return c.json({ error: "Unauthorized" }, 401);

  const [likes, ratings] = await Promise.all([
    prisma.like.findMany({ where: { userId: payload.id }, orderBy: { createdAt: "desc" } }),
    prisma.rating.findMany({ where: { userId: payload.id }, orderBy: { updatedAt: "desc" } }),
  ]);

  // Fetch TMDB details for each
  const [likedMovies, ratedMovies] = await Promise.all([
    Promise.all(likes.slice(0, 20).map(async (l) => {
      try { const m = await getMovieDetail(l.tmdbMovieId); return m; } catch { return null; }
    })),
    Promise.all(ratings.slice(0, 20).map(async (r) => {
      try { const m = await getMovieDetail(r.tmdbMovieId); return { ...m, userScore: r.score }; } catch { return null; }
    })),
  ]);

  return c.json({
    likedMovies: likedMovies.filter(Boolean),
    ratedMovies: ratedMovies.filter(Boolean),
    stats: { likes: likes.length, ratings: ratings.length },
  });
});

export default tmdb;
