import { timingSafeEqual } from "node:crypto";

export interface BearerAuthConfig {
  token: string;
  type: "bearer";
}

export type AuthConfig = BearerAuthConfig | false;

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  const len = Math.max(bufA.length, bufB.length);
  const padA = Buffer.concat([bufA, Buffer.alloc(len - bufA.length)]);
  const padB = Buffer.concat([bufB, Buffer.alloc(len - bufB.length)]);
  // Compare padded buffers first (constant-time), then check exact length equality
  return timingSafeEqual(padA, padB) && bufA.length === bufB.length;
}

export function checkAuth(req: Request, auth: AuthConfig): boolean {
  if (auth === false) {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") {
    return false;
  }

  const token = parts[1] ?? "";
  return safeCompare(token, auth.token);
}
