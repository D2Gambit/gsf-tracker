import { Hono } from "hono";
import {
  createFind,
  createFindReaction,
  getGsfReactions,
  getLatestFinds,
} from "../store/finds_store";
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
  getMemberByAccountName,
  getMembersByGroup,
} from "../store/members_store";

export const api = new Hono();

api.get("/health", (c) => {
  return c.json({ ok: true });
});

api.get("/finds/:gsfGroupId", async (c) => {
  const finds = await getLatestFinds(c.req.param("gsfGroupId"));
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

api.post("/create-reaction", async (c) => {
  const body = await c.req.parseBody();

  try {
    const result = await createFindReaction({
      gsfGroupId: body.gsfGroupId as string,
      findId: body.findId as string,
      accountName: body.accountName as string,
      emoji: body.emoji as string,
      createdAt: new Date(),
    });

    return c.json(result[0]);
  } catch (err: any) {
    if (err.message === "DUPLICATE_REACTION") {
      return c.json(
        { error: "You have already reacted with this emoji." },
        409
      );
    }

    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

api.get("/find-reactions/:gsfGroupId", async (c) => {
  return c.json(await getGsfReactions(c.req.param("gsfGroupId")));
});

api.get("/need-items/:gsfGroupId", async (c) => {
  return c.json(await getNeedItems(c.req.param("gsfGroupId")));
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

api.post("/update-is-active-need-item", async (c) => {
  const body = await c.req.parseBody();
  const result = await updateNeedItemActiveFlag(
    body.id as string,
    (body.isActive as string) === "true"
  );

  return c.json(result[0]);
});

api.get("/have-items/:gsfGroupId", async (c) => {
  return c.json(await getHaveItems(c.req.param("gsfGroupId")));
});

api.post("/add-have-item", async (c) => {
  const body = await c.req.parseBody();

  let imageUrl = null;
  if (body.image !== "null") {
    imageUrl = await uploadLootImage(body.image as File);
  }

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
    imageUrl: imageUrl ?? "",
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

api.get(`/member/:accountName`, async (c) => {
  return c.json(await getMemberByAccountName(c.req.param("accountName")));
});
