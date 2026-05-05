export interface CorsConfig {
  origin: string[];
}

export function getCorsHeaders(
  req: Request,
  cors: CorsConfig | undefined
): Record<string, string> {
  if (!cors) {
    return {};
  }

  const origin = req.headers.get("origin");
  if (!origin) {
    return {};
  }

  const allowed = cors.origin.includes(origin);
  if (!allowed) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export function isPreflight(req: Request): boolean {
  return req.method === "OPTIONS";
}
