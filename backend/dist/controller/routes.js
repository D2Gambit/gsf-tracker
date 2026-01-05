import { Hono } from "hono";
import { createFind, createFindReaction, getGsfReactions, getHotFinds, getLatestFinds, } from "../store/finds_store.js";
import { uploadLootImage } from "../config/db.js";
import { createNeedItem, deleteNeedItem, getNeedItems, updateNeedItemActiveFlag, } from "../store/needs_store.js";
import { createHaveItem, deleteHaveItem, getHaveItemCounts, getHaveItems, updateHaveItemReservedFlag, } from "../store/haves_store.js";
import { createGroup, validateGroupLogin } from "../store/groups_store.js";
import { createMember, deleteMember, getMemberByAccountName, getMembersByGroup, } from "../store/members_store.js";
export const api = new Hono();
api.get("/health", (c) => {
    return c.json({ ok: true });
});
api.get("/finds/:gsfGroupId", async (c) => {
    const gsfGroupId = c.req.param("gsfGroupId");
    const limit = Number(c.req.query("limit") ?? 9);
    const cursorParam = c.req.query("cursor");
    const cursor = cursorParam
        ? (() => {
            const parsed = JSON.parse(cursorParam);
            return {
                ...parsed,
                createdAt: new Date(parsed.createdAt),
            };
        })()
        : undefined;
    const finds = await getLatestFinds(gsfGroupId, limit, cursor);
    return c.json(finds);
});
api.get("/hot-finds/:gsfGroupId", async (c) => {
    const gsfGroupId = c.req.param("gsfGroupId");
    const finds = await getHotFinds(gsfGroupId);
    return c.json(finds);
});
api.post("/upload-finds", async (c) => {
    // image handling comes later
    const body = await c.req.parseBody();
    const imageUrl = await uploadLootImage(body.image);
    const result = await createFind({
        gsfGroupId: body.gsfGroupId,
        name: body.name,
        description: body.description,
        foundBy: body.foundBy,
        imageUrl: imageUrl,
        createdAt: new Date(),
    });
    return c.json(result[0]);
});
api.post("/create-reaction", async (c) => {
    const body = await c.req.parseBody();
    try {
        const result = await createFindReaction({
            gsfGroupId: body.gsfGroupId,
            findId: parseInt(body.findId),
            accountName: body.accountName,
            emoji: body.emoji,
            createdAt: new Date(),
        });
        return c.json(result[0]);
    }
    catch (err) {
        if (err.message === "DUPLICATE_REACTION") {
            return c.json({ error: "You have already reacted with this emoji." }, 409);
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
        gsfGroupId: body.gsfGroupId,
        name: body.name,
        description: body.description,
        requestedBy: body.requestedBy,
        priority: body.priority,
        createdAt: new Date(),
        isActive: body.isActive === "true",
    });
    return c.json(result[0]);
});
api.post("/update-is-active-need-item", async (c) => {
    const body = await c.req.parseBody();
    const result = await updateNeedItemActiveFlag(body.id, body.isActive === "true");
    return c.json(result[0]);
});
api.get("/have-items/:gsfGroupId", async (c) => {
    const limit = Number(c.req.query("limit") ?? 20);
    const tab = c.req.query("tab") ?? "all";
    const cursorParam = c.req.query("cursor");
    const accountName = c.req.query("accountName") ?? "";
    const search = c.req.query("search");
    const qualities = c.req.queries("qualities");
    const reservable = c.req.query("reservable");
    const cursor = cursorParam && cursorParam !== "null"
        ? (() => {
            const parsed = JSON.parse(cursorParam);
            if (!parsed?.createdAt)
                return undefined;
            return {
                ...parsed,
                createdAt: new Date(parsed.createdAt),
            };
        })()
        : undefined;
    const result = await getHaveItems(c.req.param("gsfGroupId"), tab, limit, search, qualities, reservable !== undefined ? reservable === "true" : undefined, accountName, cursor);
    return c.json(result);
});
api.get("/have-items/counts/:gsfGroupId", async (c) => {
    const gsfGroupId = c.req.param("gsfGroupId");
    const accountName = c.req.query("accountName");
    if (!accountName) {
        return c.json({ error: "accountName required" }, 400);
    }
    const counts = await getHaveItemCounts(gsfGroupId, accountName);
    return c.json(counts);
});
api.post("/add-have-item", async (c) => {
    const body = await c.req.parseBody();
    let imageUrl = null;
    if (body.image !== "null") {
        imageUrl = await uploadLootImage(body.image);
    }
    const result = await createHaveItem({
        gsfGroupId: body.gsfGroupId,
        name: body.name,
        description: body.description,
        foundBy: body.foundBy,
        quality: body.quality,
        createdAt: new Date(),
        isReserved: body.isReserved === "true",
        location: body.location,
        reservedBy: body.reservedBy,
        imageUrl: imageUrl ?? "",
    });
    return c.json(result[0]);
});
api.delete(`/delete-have-item/:id`, async (c) => {
    return c.json(await deleteHaveItem(c.req.param("id")));
});
api.post("/reserve-have-item", async (c) => {
    const body = await c.req.parseBody();
    const result = await updateHaveItemReservedFlag(body.id, body.isReserved === "true", body.reservedBy);
    return c.json(result[0]);
});
api.post("/create-group", async (c) => {
    const body = await c.req.parseBody();
    try {
        const result = await createGroup({
            gsfGroupId: body.gsfGroupId,
            password: body.password,
            createdAt: new Date(),
        });
        return c.json(result[0]);
    }
    catch (err) {
        if (err.message === "DUPLICATE_REACTION") {
            return c.json({ error: "GSF Group already exists! Please try again." }, 409);
        }
        console.error(err);
        return c.json({ error: "Internal server error" }, 500);
    }
});
api.post("/login", async (c) => {
    const body = await c.req.parseBody();
    const result = await validateGroupLogin(body.gsfGroupId, body.password);
    return c.json(result);
});
api.post("/create-member", async (c) => {
    const body = await c.req.parseBody();
    try {
        const result = await createMember({
            gsfGroupId: body.gsfGroupId,
            accountName: body.accountName,
            characterName: body.characterName,
            role: body.role,
            hasPlayedGsf: body.hasPlayedGsf === "true",
            createdAt: new Date(),
            preferredTimezone: body.preferredTimezone,
            preferredClass: body.preferredClass,
            preferredSecondaryClass: body.preferredSecondaryClass,
            discordName: body.discordName,
        });
        return c.json(result[0]);
    }
    catch (err) {
        if (err.message === "DUPLICATE_REACTION") {
            return c.json({ error: "GSF member already exists! Please try again." }, 409);
        }
        console.error(err);
        return c.json({ error: "Internal server error" }, 500);
    }
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
