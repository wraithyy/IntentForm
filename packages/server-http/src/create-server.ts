import type { Server } from "node:http";
import { createServer as createNodeServer } from "node:http";
import type { IntentFormEngine } from "@intentform/core";
import { createIntentFormRoute } from "@intentform/server";
import type { AuthConfig } from "./auth.js";
import { checkAuth } from "./auth.js";
import type { CorsConfig } from "./cors.js";
import { getCorsHeaders, isPreflight } from "./cors.js";
import { createHealthResponse } from "./health.js";
import {
  incomingMessageToRequest,
  responseToServerResponse,
} from "./node-fetch-adapter.js";

export interface CreateServerOptions {
  auth?: AuthConfig;
  cors?: CorsConfig;
  engine: IntentFormEngine;
  host?: string;
  path?: string;
  port?: number;
}

export interface IntentFormServer {
  close(): Promise<void>;
  listen(): Promise<void>;
  readonly port: number;
}

function applyHeaders(res: Response, extra: Record<string, string>): Response {
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(extra)) {
    headers.set(key, value);
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function createServer(options: CreateServerOptions): IntentFormServer {
  const {
    engine,
    port: configuredPort = 0,
    host = "0.0.0.0",
    path: intentPath = "/api/intent",
    auth = false,
    cors,
  } = options;

  const routeHandler = createIntentFormRoute(engine);
  let _server: Server | null = null;

  async function handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request, cors);

    if (url.pathname === "/health") {
      const res = createHealthResponse(engine);
      return applyHeaders(res, corsHeaders);
    }

    if (isPreflight(request)) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === intentPath && request.method === "POST") {
      if (!checkAuth(request, auth)) {
        const res = jsonResponse({ error: "Unauthorized" }, 401);
        return applyHeaders(res, corsHeaders);
      }
      const res = await routeHandler(request);
      return applyHeaders(res, corsHeaders);
    }

    const res = jsonResponse({ error: "Not found" }, 404);
    return applyHeaders(res, corsHeaders);
  }

  const nodeServer = createNodeServer((req, res) => {
    incomingMessageToRequest(req)
      .then((request) => handleRequest(request))
      .then((response) => responseToServerResponse(response, res))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Internal error";
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: message }));
      });
  });

  _server = nodeServer;

  return {
    listen(): Promise<void> {
      return new Promise<void>((resolve) => {
        nodeServer.listen(configuredPort, host, () => {
          resolve();
        });
      });
    },

    close(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        nodeServer.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },

    get port(): number {
      const addr = nodeServer.address();
      if (addr && typeof addr === "object") {
        return addr.port;
      }
      return configuredPort;
    },
  };
}
