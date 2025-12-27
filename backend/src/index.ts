import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { api } from "./controller/routes";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "node:path";

const app = new Hono();

// API
app.route("/api", api);

// Serve frontend build
app.use(
  "*",
  serveStatic({
    root: path.resolve("../frontend/dist"),
  })
);

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8080,
});
