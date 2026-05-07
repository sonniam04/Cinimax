import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verifyToken } from "../lib/jwt.js";

export async function authGuard(c: Context, next: Next) {
  const token = getCookie(c, "token");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const payload = verifyToken(token);
  if (!payload) return c.json({ error: "Invalid token" }, 401);

  c.set("user", payload);
  await next();
}

export function getUser(c: Context) {
  return c.get("user") as { id: string; email: string; name: string | null } | undefined;
}
