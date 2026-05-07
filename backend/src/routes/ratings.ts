import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authGuard, getUser } from "../middleware/auth.js";

const ratings = new Hono();

ratings.get("/", authGuard, async (c) => {
  const user = getUser(c)!;
  const movieId = c.req.query("movieId");
  if (!movieId) return c.json({ error: "Missing movieId" }, 400);

  const rating = await prisma.rating.findUnique({
    where: { userId_tmdbMovieId: { userId: user.id, tmdbMovieId: movieId } },
  });
  return c.json({ rating: rating?.score ?? null });
});

ratings.post("/", authGuard, async (c) => {
  const user = getUser(c)!;
  const { tmdbMovieId, score } = await c.req.json();
  if (!tmdbMovieId || score === undefined) return c.json({ error: "Missing fields" }, 400);
  if (score < 1 || score > 10) return c.json({ error: "Score must be 1-10" }, 400);

  const rating = await prisma.rating.upsert({
    where: { userId_tmdbMovieId: { userId: user.id, tmdbMovieId } },
    update: { score },
    create: { userId: user.id, tmdbMovieId, score },
  });
  return c.json({ rating: rating.score });
});

ratings.delete("/", authGuard, async (c) => {
  const user = getUser(c)!;
  const movieId = c.req.query("movieId");
  if (!movieId) return c.json({ error: "Missing movieId" }, 400);

  await prisma.rating.deleteMany({ where: { userId: user.id, tmdbMovieId: movieId } });
  return c.json({ ok: true });
});

export default ratings;
