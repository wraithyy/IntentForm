import type { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { incomingMessageToRequest } from "../node-fetch-adapter.js";

function makeIncomingMessage(
  options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): IncomingMessage {
  const readable = Readable.from(
    options.body ? [Buffer.from(options.body, "utf8")] : []
  );
  Object.assign(readable, {
    method: options.method ?? "GET",
    url: options.url ?? "/",
    headers: { host: "localhost", ...(options.headers ?? {}) },
  });
  return readable as unknown as IncomingMessage;
}

describe("incomingMessageToRequest", () => {
  it("converts a GET request with no body", async () => {
    const incoming = makeIncomingMessage({
      method: "GET",
      url: "/health",
    });
    const req = await incomingMessageToRequest(incoming);
    expect(req.method).toBe("GET");
    expect(new URL(req.url).pathname).toBe("/health");
  });

  it("converts a POST request with JSON body", async () => {
    const bodyContent = JSON.stringify({ prompt: "hello" });
    const incoming = makeIncomingMessage({
      method: "POST",
      url: "/api/intent",
      headers: { "content-type": "application/json" },
      body: bodyContent,
    });
    const req = await incomingMessageToRequest(incoming);
    expect(req.method).toBe("POST");
    expect(req.headers.get("content-type")).toBe("application/json");
    const text = await req.text();
    expect(text).toBe(bodyContent);
  });

  it("sets correct URL including host header", async () => {
    const incoming = makeIncomingMessage({
      method: "GET",
      url: "/api/intent?foo=bar",
      headers: { host: "myserver:4000" },
    });
    const req = await incomingMessageToRequest(incoming);
    const url = new URL(req.url);
    expect(url.host).toBe("myserver:4000");
    expect(url.pathname).toBe("/api/intent");
    expect(url.searchParams.get("foo")).toBe("bar");
  });
});
