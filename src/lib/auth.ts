import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
export type User = { id: string; email: string; name: string; role: string };
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get("precision_session")?.value;
  if (!token) return null;
  return (
    (db()
      .prepare(
        "SELECT users.id,users.email,users.name,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires_at>?",
      )
      .get(digest(token), Date.now()) as User) || null
  );
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  db().prepare("DELETE FROM sessions WHERE expires_at<?").run(Date.now());
  db()
    .prepare("INSERT INTO sessions VALUES(?,?,?)")
    .run(digest(token), userId, Date.now() + 7 * 86400000);
  (await cookies()).set("precision_session", token, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" &&
      process.env.STUDIO_COOKIE_SECURE !== "false",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
  });
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get("precision_session")?.value;
  if (token)
    db().prepare("DELETE FROM sessions WHERE token=?").run(digest(token));
  jar.delete("precision_session");
}
