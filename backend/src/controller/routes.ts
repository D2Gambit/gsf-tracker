import { Hono } from "hono";
import { createFind, getLatestFinds } from "../store/finds_store";
import { uploadLootImage } from "../config/db";
import { createNeedItem, getNeedItems } from "../store/needs_store";

export const api = new Hono();

api.get("/health", (c) => {
  return c.json({ ok: true });
});

api.get("/finds", async (c) => {
  const finds = await getLatestFinds();
  return c.json(finds);
});

api.post("/upload-finds", async (c) => {
  // image handling comes later
  const body = await c.req.parseBody();

  const imageUrl = await uploadLootImage(body.image as File);

  const result = await createFind({
    gsfGroupId: body.gsfGroupId as string,
    name: body.name as string,
    description: body.description as string,
    foundBy: body.foundBy as string,
    imageUrl: imageUrl,
    createdAt: new Date(),
  });

  return c.json(result[0]);
});

api.get("/need-items", async (c) => {
  return c.json(await getNeedItems());
});

api.post("/add-need-item", async (c) => {
  const body = await c.req.parseBody();

  console.log("Received body:", body);

  const result = await createNeedItem({
    gsfGroupId: body.gsfGroupId as string,
    name: body.name as string,
    description: body.description as string,
    requestedBy: body.requestedBy as string,
    priority: body.priority as string,
    createdAt: new Date(),
    isActive: (body.isActive as string) === "true",
  });

  return c.json(result[0]);
});

api.post("/add-have-item", async (c) => {
  // later: parse body, save file, write DB row
  return c.json({
    success: true,
    message: "Add have item endpoint hit",
    timestamp: new Date().toISOString(),
  });
});
