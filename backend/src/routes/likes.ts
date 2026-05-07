import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authGuard, getUser } from "../middleware/auth.js";

const likes = new Hono();

likes.get("/", authGuard, async (c) => {
  const user = getUser(c)!;
  const movieId = c.req.query("movieId");
  if (!movieId) return c.json({ error: "Missing movieId" }, 400);

  const like = await prisma.like.findUnique({
    where: { userId_tmdbMovieId: { userId: user.id, tmdbMovieId: movieId } },
  });
  return c.json({ liked: !!like });
});

likes.post("/", authGuard, async (c) => {
  const user = getUser(c)!;
  const { tmdbMovieId } = await c.req.json();
  if (!tmdbMovieId) return c.json({ error: "Missing movieId" }, 400);

  await prisma.like.upsert({
    where: { userId_tmdbMovieId: { userId: user.id, tmdbMovieId } },
    update: {},
    create: { userId: user.id, tmdbMovieId },
  });
  return c.json({ liked: true });
});

likes.delete("/", authGuard, async (c) => {
  const user = getUser(c)!;
  const movieId = c.req.query("movieId");
  if (!movieId) return c.json({ error: "Missing movieId" }, 400);

  await prisma.like.deleteMany({ where: { userId: user.id, tmdbMovieId: movieId } });
  return c.json({ liked: false });
});

// Get all liked movies for a user (for profile page)
likes.get("/all", authGuard, async (c) => {
  const user = getUser(c)!;
  const liked = await prisma.like.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return c.json({ likes: liked });
});

export default likes;
