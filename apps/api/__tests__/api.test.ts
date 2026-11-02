import request from "supertest";
import { createApp } from "../src/index.js";

const app = createApp();

// ── Health ────────────────────────────────────────────────────────────────────
describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

// ── Flavors ───────────────────────────────────────────────────────────────────
describe("GET /api/flavors", () => {
  it("returns a non-empty array of flavors", async () => {
    const res = await request(app).get("/api/flavors");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("each flavor has required fields", async () => {
    const res = await request(app).get("/api/flavors");
    for (const flavor of res.body) {
      expect(flavor).toHaveProperty("id");
      expect(flavor).toHaveProperty("name");
      expect(flavor).toHaveProperty("price");
      expect(flavor).toHaveProperty("category");
      expect(flavor).toHaveProperty("allergens");
      expect(flavor).toHaveProperty("isVegan");
      expect(flavor).toHaveProperty("isAvailable");
      expect(flavor).toHaveProperty("isFeatured");
    }
  });

  it("includes at least 2 unavailable flavors", async () => {
    const res = await request(app).get("/api/flavors");
    const unavailable = res.body.filter((f: { isAvailable: boolean }) => !f.isAvailable);
    expect(unavailable.length).toBeGreaterThanOrEqual(2);
  });

  it("includes at least 4 vegan flavors", async () => {
    const res = await request(app).get("/api/flavors");
    const vegan = res.body.filter((f: { isVegan: boolean }) => f.isVegan);
    expect(vegan.length).toBeGreaterThanOrEqual(4);
  });

  it("includes a flavor with null imageUrl", async () => {
    const res = await request(app).get("/api/flavors");
    const noImage = res.body.find((f: { imageUrl: string | null }) => f.imageUrl === null);
    expect(noImage).toBeDefined();
  });
});

describe("GET /api/flavors/:id", () => {
  it("returns a single flavor by id", async () => {
    const res = await request(app).get("/api/flavors/pistachio-crisis");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("pistachio-crisis");
  });

  it("returns 404 with error shape for an unknown flavor", async () => {
    const res = await request(app).get("/api/flavors/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "FLAVOR_NOT_FOUND");
    expect(typeof res.body.error.message).toBe("string");
  });
});

// ── Orders ────────────────────────────────────────────────────────────────────
describe("POST /api/orders", () => {
  it("accepts a valid order and returns confirmation", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "midnight-chocolate", quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("confirmed");
    expect(typeof res.body.orderId).toBe("string");
    expect(typeof res.body.total).toBe("number");
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("calculates total server-side, ignoring any client price", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ flavorId: "midnight-chocolate", quantity: 1, price: 0.01 }],
      });

    expect(res.status).toBe(201);
    // midnight-chocolate is priced at 4.50
    expect(res.body.total).toBe(4.5);
    expect(res.body.items[0].unitPrice).toBe(4.5);
  });

  it("returns 400 with INVALID_QUANTITY for quantity 0", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "midnight-chocolate", quantity: 0 }] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_QUANTITY");
  });

  it("returns 400 with INVALID_QUANTITY for fractional quantity", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "midnight-chocolate", quantity: 1.5 }] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_QUANTITY");
  });

  it("returns 400 with FLAVOR_NOT_FOUND for unknown flavor", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "ghost-flavor", quantity: 1 }] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("FLAVOR_NOT_FOUND");
  });

  it("returns 400 with FLAVOR_UNAVAILABLE for an unavailable flavor", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "production-pistachio", quantity: 1 }] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("FLAVOR_UNAVAILABLE");
  });

  it("returns 400 with INVALID_ORDER for an empty items array", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ORDER");
  });

  it("returns 400 with INVALID_ORDER when items key is missing", async () => {
    const res = await request(app).post("/api/orders").send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ORDER");
  });

  it("handles multi-item orders and sums totals correctly", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { flavorId: "midnight-chocolate", quantity: 2 }, // 2 × 4.50 = 9.00
          { flavorId: "lemon-zest", quantity: 1 },         // 1 × 3.50 = 3.50
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(12.5);
    expect(res.body.items).toHaveLength(2);
  });
});
