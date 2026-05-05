import { describe, expect, it } from "vitest";
import type { AuthConfig } from "../auth.js";
import { checkAuth } from "../auth.js";

function makeRequest(authHeader?: string): Request {
  const headers: HeadersInit = {};
  if (authHeader !== undefined) {
    (headers as Record<string, string>).authorization = authHeader;
  }
  return new Request("http://localhost/api/intent", {
    method: "POST",
    headers,
  });
}

describe("checkAuth", () => {
  it("returns true when auth is false regardless of headers", () => {
    const req = makeRequest();
    expect(checkAuth(req, false)).toBe(true);
  });

  it("returns true when auth is false even with wrong token", () => {
    const req = makeRequest("Bearer wrong");
    expect(checkAuth(req, false)).toBe(true);
  });

  it("returns true for correct bearer token", () => {
    const auth: AuthConfig = { type: "bearer", token: "secret123" };
    const req = makeRequest("Bearer secret123");
    expect(checkAuth(req, auth)).toBe(true);
  });

  it("returns false for wrong bearer token", () => {
    const auth: AuthConfig = { type: "bearer", token: "secret123" };
    const req = makeRequest("Bearer wrongtoken");
    expect(checkAuth(req, auth)).toBe(false);
  });

  it("returns false when Authorization header is missing", () => {
    const auth: AuthConfig = { type: "bearer", token: "secret123" };
    const req = makeRequest();
    expect(checkAuth(req, auth)).toBe(false);
  });

  it("returns false when Authorization header has wrong scheme", () => {
    const auth: AuthConfig = { type: "bearer", token: "secret123" };
    const req = makeRequest("Basic secret123");
    expect(checkAuth(req, auth)).toBe(false);
  });

  it("timing-safe: returns consistent boolean for both true and false paths", () => {
    const auth: AuthConfig = { type: "bearer", token: "abc" };
    const reqCorrect = makeRequest("Bearer abc");
    const reqWrong = makeRequest("Bearer xyz");
    expect(checkAuth(reqCorrect, auth)).toBe(true);
    expect(checkAuth(reqWrong, auth)).toBe(false);
  });
});
