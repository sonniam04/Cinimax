import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "fallback-secret";

export interface JWTPayload {
  id: string;
  email: string;
  name: string | null;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
