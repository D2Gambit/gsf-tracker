import { Hono } from "hono";
import { createFind, getLatestFinds } from "../store/finds_store";
import { uploadLootImage } from "../config/db";
import {
  createNeedItem,
  deleteNeedItem,
  getNeedItems,
  updateNeedItemActiveFlag,
} from "../store/needs_store";
import {
  createHaveItem,
  deleteHaveItem,
  getHaveItems,
  updateHaveItemReservedFlag,
} from "../store/haves_store";
import { createGroup, validateGroupLogin } from "../store/groups_store";
import {
  createMember,
  deleteMember,
  getMembersByGroup,
} from "../store/members_store";

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

api.delete(`/delete-need-item/:id`, async (c) => {
  return c.json(await deleteNeedItem(c.req.param("id")));
});

api.post("/add-need-item", async (c) => {
  const body = await c.req.parseBody();

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

api.post("/is-active-need-item", async (c) => {
  const body = await c.req.parseBody();
  const result = await updateNeedItemActiveFlag(
    body.id as string,
    (body.isActive as string) === "true"
  );

  return c.json(result[0]);
});

api.get("/have-items", async (c) => {
  return c.json(await getHaveItems());
});

api.post("/add-have-item", async (c) => {
  const body = await c.req.parseBody();
  const result = await createHaveItem({
    gsfGroupId: body.gsfGroupId as string,
    name: body.name as string,
    description: body.description as string,
    foundBy: body.foundBy as string,
    quality: body.quality as string,
    createdAt: new Date(),
    isReserved: (body.isReserved as string) === "true",
    location: body.location as string,
    reservedBy: body.reservedBy as string,
  });

  return c.json(result[0]);
});

api.delete(`/delete-have-item/:id`, async (c) => {
  return c.json(await deleteHaveItem(c.req.param("id")));
});

api.post("/reserve-have-item", async (c) => {
  const body = await c.req.parseBody();
  const result = await updateHaveItemReservedFlag(
    body.id as string,
    (body.isReserved as string) === "true",
    body.reservedBy as string
  );

  return c.json(result[0]);
});

api.post("/create-group", async (c) => {
  const body = await c.req.parseBody();
  const result = await createGroup({
    gsfGroupId: body.gsfGroupId as string,
    password: body.password as string,
    createdAt: new Date(),
  });

  return c.json(result[0]);
});

api.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const result = await validateGroupLogin(
    body.gsfGroupId as string,
    body.password as string
  );

  return c.json(result);
});

api.post("/create-member", async (c) => {
  const body = await c.req.parseBody();
  const result = await createMember({
    gsfGroupId: body.gsfGroupId as string,
    accountName: body.accountName as string,
    characterName: body.characterName as string,
    role: body.role as string,
    hasPlayedGsf: (body.hasPlayedGsf as string) === "true",
    createdAt: new Date(),
    preferredTimezone: body.preferredTimezone as string,
    preferredClass: body.preferredClass as string,
    preferredSecondaryClass: body.preferredSecondaryClass as string,
    discordName: body.discordName as string,
  });

  return c.json(result[0]);
});

api.get("/members/:gsfGroupId", async (c) => {
  const gsfGroupId = c.req.param("gsfGroupId");
  const result = await getMembersByGroup(gsfGroupId);
  return c.json(result);
});

api.delete(`/delete-member/:id`, async (c) => {
  return c.json(await deleteMember(c.req.param("id")));
});
