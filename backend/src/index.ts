import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { api } from "./controller/routes.js";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "node:path";
import fs from "node:fs";
import { startExpireReservedItemsJob } from "./cron/expireReservedItems.js";
import { fileURLToPath } from "url";

const app = new Hono();

// --------------------
// API
// --------------------
app.route("/api", api);

startExpireReservedItemsJob();

// --------------------
// Frontend
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

// Serve static assets
app.use("/assets/*", serveStatic({ root: frontendDistPath }));

app.use("/*.ico", serveStatic({ root: frontendDistPath }));

// SPA fallback
app.get("*", async (c) => {
  return c.html(
    await fs.promises.readFile(
      path.join(frontendDistPath, "index.html"),
      "utf-8"
    )
  );
});

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8080,
});
