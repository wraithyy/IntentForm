import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.js";

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
  });
}

let _router: ReturnType<typeof createRouter> | undefined;

export async function getRouter() {
  if (!_router) {
    _router = createRouter();
  }
  return _router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
