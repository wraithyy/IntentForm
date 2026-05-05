import { createIntentForm } from "@intentform/core";
import { openaiProvider } from "@intentform/provider-openai";
import {
  createIntentFormRoute,
  createIntentFormServerFn,
} from "@intentform/server";
import { accidentReportModel, contactFormModel } from "../models.js";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY not set");
}

const engine = createIntentForm({
  models: [contactFormModel, accidentReportModel],
  provider: openaiProvider({ apiKey }),
});

/** TanStack Start server function for SSR / loader usage. */
export const resolveIntent = createIntentFormServerFn(engine);

/** Web Fetch handler exposed at /api/intent for client-side usage. */
export const intentRouteHandler = createIntentFormRoute(engine);
