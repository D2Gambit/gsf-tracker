import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { api } from "./controller/routes.js";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "node:path";
import { startExpireReservedItemsJob } from "./cron/expireReservedItems.js";
import { fileURLToPath } from "url";

const app = new Hono();

// API
app.route("/api", api);

startExpireReservedItemsJob();

// Serve frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

app.use(
  "*",
  serveStatic({
    root: frontendDistPath,
  })
);

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8080,
});
