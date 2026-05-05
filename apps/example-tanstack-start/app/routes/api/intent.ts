import { createAPIFileRoute } from "@tanstack/react-start/api";
import { intentRouteHandler } from "../../server/intent.js";

export const APIRoute = createAPIFileRoute("/api/intent")({
  POST: ({ request }) => intentRouteHandler(request),
});
