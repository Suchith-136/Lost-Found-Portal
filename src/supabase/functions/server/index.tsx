import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f360d15a/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all items (lost and found)
app.get("/make-server-f360d15a/items", async (c) => {
  try {
    const items = await kv.getByPrefix("item:");
    return c.json({ items: items || [] });
  } catch (error) {
    console.log("Error fetching items:", error);
    return c.json({ error: "Failed to fetch items", details: String(error) }, 500);
  }
});

// Create a new item (lost or found)
app.post("/make-server-f360d15a/items", async (c) => {
  try {
    const body = await c.req.json();
    const itemId = `item:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const item = {
      id: itemId,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(itemId, item);
    return c.json({ item });
  } catch (error) {
    console.log("Error creating item:", error);
    return c.json({ error: "Failed to create item", details: String(error) }, 500);
  }
});

// Get all claims
app.get("/make-server-f360d15a/claims", async (c) => {
  try {
    const claims = await kv.getByPrefix("claim:");
    return c.json({ claims: claims || [] });
  } catch (error) {
    console.log("Error fetching claims:", error);
    return c.json({ error: "Failed to fetch claims", details: String(error) }, 500);
  }
});

// Create a new claim
app.post("/make-server-f360d15a/claims", async (c) => {
  try {
    const body = await c.req.json();
    const claimId = `claim:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const claim = {
      id: claimId,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(claimId, claim);
    return c.json({ claim });
  } catch (error) {
    console.log("Error creating claim:", error);
    return c.json({ error: "Failed to create claim", details: String(error) }, 500);
  }
});

// Get stats
app.get("/make-server-f360d15a/stats", async (c) => {
  try {
    const items = await kv.getByPrefix("item:");
    const claims = await kv.getByPrefix("claim:");
    
    const lostCount = items.filter((item: any) => item.type === "lost").length;
    const foundCount = items.filter((item: any) => item.type === "found").length;
    const claimsCount = claims.length;
    const reunionsCount = Math.min(lostCount, foundCount);
    
    return c.json({
      lostCount,
      foundCount,
      claimsCount,
      reunionsCount
    });
  } catch (error) {
    console.log("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch stats", details: String(error) }, 500);
  }
});

// Get all theft reports
app.get("/make-server-f360d15a/theft-reports", async (c) => {
  try {
    const reports = await kv.getByPrefix("theft:");
    return c.json({ reports: reports || [] });
  } catch (error) {
    console.log("Error fetching theft reports:", error);
    return c.json({ error: "Failed to fetch theft reports", details: String(error) }, 500);
  }
});

// Create a new theft report
app.post("/make-server-f360d15a/theft-reports", async (c) => {
  try {
    const body = await c.req.json();
    const reportId = `theft:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const report = {
      id: reportId,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(reportId, report);
    return c.json({ report });
  } catch (error) {
    console.log("Error creating theft report:", error);
    return c.json({ error: "Failed to create theft report", details: String(error) }, 500);
  }
});

// Update a theft report
app.put("/make-server-f360d15a/theft-reports/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const report = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(id, report);
    return c.json({ report });
  } catch (error) {
    console.log("Error updating theft report:", error);
    return c.json({ error: "Failed to update theft report", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);