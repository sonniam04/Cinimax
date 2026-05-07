import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken, verifyToken } from "../lib/jwt.js";

const auth = new Hono();

auth.post("/register", async (c) => {
  const { name, email, password } = await c.req.json();
  if (!name || !email || !password)
    return c.json({ error: "Missing fields" }, 400);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return c.json({ error: "emailExists" }, 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  setCookie(c, "token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "Lax",
  });

  return c.json({ user: { id: user.id, name: user.name, email: user.email } }, 201);
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: "Missing fields" }, 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  setCookie(c, "token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "Lax",
  });

  return c.json({ user: { id: user.id, name: user.name, email: user.email } });
});

auth.post("/logout", (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.json({ ok: true });
});

auth.get("/me", (c) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ user: null });

  const payload = verifyToken(token);
  if (!payload) return c.json({ user: null });

  return c.json({ user: { id: payload.id, email: payload.email, name: payload.name } });
});

export default auth;
