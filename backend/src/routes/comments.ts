import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authGuard, getUser } from "../middleware/auth.js";

const comments = new Hono();

comments.get("/", async (c) => {
  const movieId = c.req.query("movieId");
  const page = parseInt(c.req.query("page") ?? "1");
  const limit = 20;
  if (!movieId) return c.json({ error: "Missing movieId" }, 400);

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where: { tmdbMovieId: movieId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where: { tmdbMovieId: movieId } }),
  ]);

  return c.json({ comments: items, total, page, totalPages: Math.ceil(total / limit) });
});

comments.post("/", authGuard, async (c) => {
  const user = getUser(c)!;
  const { tmdbMovieId, body } = await c.req.json();
  if (!tmdbMovieId || !body?.trim()) return c.json({ error: "Missing fields" }, 400);

  const comment = await prisma.comment.create({
    data: { userId: user.id, tmdbMovieId, body: body.trim() },
    include: { user: { select: { id: true, name: true, image: true } } },
  });
  return c.json({ comment }, 201);
});

comments.put("/:id", authGuard, async (c) => {
  const user = getUser(c)!;
  const id = c.req.param("id");
  const { body } = await c.req.json();

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.userId !== user.id)
    return c.json({ error: "Forbidden" }, 403);

  const updated = await prisma.comment.update({
    where: { id },
    data: { body: body.trim() },
    include: { user: { select: { id: true, name: true, image: true } } },
  });
  return c.json({ comment: updated });
});

comments.delete("/:id", authGuard, async (c) => {
  const user = getUser(c)!;
  const id = c.req.param("id");

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.userId !== user.id)
    return c.json({ error: "Forbidden" }, 403);

  await prisma.comment.delete({ where: { id } });
  return c.json({ ok: true });
});

export default comments;
