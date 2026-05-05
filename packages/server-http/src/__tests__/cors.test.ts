import { describe, expect, it } from "vitest";
import type { CorsConfig } from "../cors.js";
import { getCorsHeaders, isPreflight } from "../cors.js";

function makeRequest(method: string, origin?: string): Request {
  const headers: HeadersInit = {};
  if (origin) {
    (headers as Record<string, string>).origin = origin;
  }
  return new Request("http://localhost/api/intent", { method, headers });
}

describe("getCorsHeaders", () => {
  it("returns empty object when cors is undefined", () => {
    const req = makeRequest("POST", "https://example.com");
    expect(getCorsHeaders(req, undefined)).toEqual({});
  });

  it("returns CORS headers for origin in allowlist", () => {
    const cors: CorsConfig = { origin: ["https://example.com"] };
    const req = makeRequest("POST", "https://example.com");
    const headers = getCorsHeaders(req, cors);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://example.com");
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, GET, OPTIONS");
    expect(headers["Access-Control-Allow-Headers"]).toBe(
      "Content-Type, Authorization"
    );
    expect(headers.Vary).toBe("Origin");
  });

  it("returns empty object for origin NOT in allowlist", () => {
    const cors: CorsConfig = { origin: ["https://example.com"] };
    const req = makeRequest("POST", "https://evil.com");
    const headers = getCorsHeaders(req, cors);
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("returns empty object when Origin header is absent", () => {
    const cors: CorsConfig = { origin: ["https://example.com"] };
    const req = makeRequest("POST");
    expect(getCorsHeaders(req, cors)).toEqual({});
  });
});

describe("isPreflight", () => {
  it("returns true for OPTIONS method", () => {
    expect(isPreflight(makeRequest("OPTIONS"))).toBe(true);
  });

  it("returns false for POST method", () => {
    expect(isPreflight(makeRequest("POST"))).toBe(false);
  });

  it("returns false for GET method", () => {
    expect(isPreflight(makeRequest("GET"))).toBe(false);
  });
});
