import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import auth from "./routes/auth.js";
import ratings from "./routes/ratings.js";
import likes from "./routes/likes.js";
import comments from "./routes/comments.js";
import tmdb from "./routes/tmdb.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use("*", logger());

app.route("/auth", auth);
app.route("/ratings", ratings);
app.route("/likes", likes);
app.route("/comments", comments);
app.route("/tmdb", tmdb);

app.get("/health", (c) => c.json({ ok: true }));

const port = parseInt(process.env.PORT ?? "4000");
console.log(`🎬 Cinemax Backend running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
