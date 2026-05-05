import type { IncomingMessage, ServerResponse } from "node:http";

export async function incomingMessageToRequest(
  req: IncomingMessage
): Promise<Request> {
  const host = req.headers.host ?? "localhost";
  const url = `http://${host}${req.url ?? "/"}`;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const body = chunks.length > 0 ? Buffer.concat(chunks) : null;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(key, v);
      }
    } else {
      headers.set(key, value);
    }
  }

  return new Request(url, {
    method: req.method ?? "GET",
    headers,
    body: body && body.length > 0 ? body : null,
  });
}

export async function responseToServerResponse(
  res: Response,
  serverRes: ServerResponse
): Promise<void> {
  serverRes.statusCode = res.status;
  serverRes.statusMessage = res.statusText;

  for (const [key, value] of res.headers.entries()) {
    serverRes.setHeader(key, value);
  }

  if (res.body) {
    const reader = res.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        serverRes.write(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  serverRes.end();
}
