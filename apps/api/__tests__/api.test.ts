import request from "supertest";
import { createApp, resetData } from "../src/index.js";

const app = createApp();

beforeEach(() => {
  resetData();
});

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

// ── Sizes, toppings and stock ─────────────────────────────────────────────────
async function stockOf(flavorId: string): Promise<number> {
  const res = await request(app).get(`/api/flavors/${flavorId}`);
  return res.body.stockRemaining;
}

describe("GET /api/sizes and /api/toppings", () => {
  it("lists sizes with price modifiers", async () => {
    const res = await request(app).get("/api/sizes");
    expect(res.status).toBe(200);
    const byId = Object.fromEntries(
      res.body.map((s: { id: string; priceModifier: number }) => [s.id, s.priceModifier])
    );
    expect(byId).toEqual({ small: -0.5, regular: 0, large: 1.5 });
  });

  it("lists toppings including a vegan, a nut, a gluten and an unavailable one", async () => {
    const res = await request(app).get("/api/toppings");
    expect(res.status).toBe(200);
    type T = { isVegan: boolean; isAvailable: boolean; allergens: string[] };
    expect(res.body.some((t: T) => t.isVegan)).toBe(true);
    expect(res.body.some((t: T) => t.allergens.includes("nuts"))).toBe(true);
    expect(res.body.some((t: T) => t.allergens.includes("gluten"))).toBe(true);
    expect(res.body.some((t: T) => !t.isAvailable)).toBe(true);
  });
});

describe("Flavor stock", () => {
  it("keeps stockRemaining consistent with isAvailable and includes low-stock flavors", async () => {
    const res = await request(app).get("/api/flavors");
    type F = { isAvailable: boolean; stockRemaining: number };
    for (const f of res.body as F[]) {
      expect(typeof f.stockRemaining).toBe("number");
      if (!f.isAvailable) expect(f.stockRemaining).toBe(0);
    }
    const low = (res.body as F[]).filter(
      (f) => f.stockRemaining >= 2 && f.stockRemaining <= 4
    );
    expect(low.length).toBeGreaterThanOrEqual(2);
  });
});

describe("POST /api/orders — sizes, toppings and stock", () => {
  it("old-style order without size or toppings still succeeds", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "midnight-chocolate", quantity: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(4.5);
    expect(res.body.items[0].toppings).toEqual([]);
  });

  it("omitted size defaults to regular", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "midnight-chocolate", quantity: 1 }] });

    expect(res.body.items[0].size.id).toBe("regular");
    expect(res.body.items[0].basePrice).toBe(4.5);
    expect(res.body.items[0].unitPrice).toBe(4.5);
  });

  it("size changes the server-calculated price", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { flavorId: "midnight-chocolate", quantity: 2, sizeId: "large" }, // (4.50 + 1.50) × 2
          { flavorId: "lemon-zest", quantity: 1, sizeId: "small" },         // 3.50 - 0.50
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.items[0].unitPrice).toBe(6);
    expect(res.body.items[0].subtotal).toBe(12);
    expect(res.body.items[1].unitPrice).toBe(3);
    expect(res.body.total).toBe(15);
  });

  it("toppings change the server-calculated price", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          {
            flavorId: "midnight-chocolate",
            quantity: 2,
            sizeId: "large",
            toppingIds: ["roasted-nuts", "fresh-berries"], // 0.75 + 1.00
          },
        ],
      });

    expect(res.status).toBe(201);
    // (4.50 + 1.50 + 1.75) × 2 = 15.50
    expect(res.body.items[0].unitPrice).toBe(7.75);
    expect(res.body.total).toBe(15.5);
    expect(res.body.items[0].toppings).toHaveLength(2);
  });

  it("rejects an unavailable topping", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { flavorId: "midnight-chocolate", quantity: 1, toppingIds: ["honeycomb-crunch"] },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("TOPPING_UNAVAILABLE");
  });

  it("rejects duplicate toppings on the same item", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          {
            flavorId: "midnight-chocolate",
            quantity: 1,
            toppingIds: ["rainbow-sprinkles", "rainbow-sprinkles"],
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("DUPLICATE_TOPPING");
  });

  it("rejects an unknown topping", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ flavorId: "midnight-chocolate", quantity: 1, toppingIds: ["gravy"] }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("TOPPING_NOT_FOUND");
  });

  it("rejects an invalid size", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ flavorId: "midnight-chocolate", quantity: 1, sizeId: "gigantic" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_SIZE");
  });

  it("rejects ordering more than the remaining stock", async () => {
    const before = await stockOf("pistachio-crisis");
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "pistachio-crisis", quantity: before + 1 }] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
    expect(res.body.error.message).toContain("Pistachio Crisis");
    expect(res.body.error.message).toContain(String(before));
    expect(await stockOf("pistachio-crisis")).toBe(before);
  });

  it("counts the same flavor across several items against its stock", async () => {
    const before = await stockOf("pistachio-crisis");
    const half = Math.ceil((before + 1) / 2);
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { flavorId: "pistachio-crisis", quantity: half },
          { flavorId: "pistachio-crisis", quantity: half, sizeId: "large" },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("a successful order decreases stock", async () => {
    const before = await stockOf("lemon-zest");
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ flavorId: "lemon-zest", quantity: 3 }] });

    expect(res.status).toBe(201);
    expect(await stockOf("lemon-zest")).toBe(before - 3);
  });

  it("a failed multi-item order does not partially decrease stock", async () => {
    const lemonBefore = await stockOf("lemon-zest");
    const pistachioBefore = await stockOf("pistachio-crisis");
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { flavorId: "lemon-zest", quantity: 1 },
          { flavorId: "pistachio-crisis", quantity: pistachioBefore + 1 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
    expect(await stockOf("lemon-zest")).toBe(lemonBefore);
    expect(await stockOf("pistachio-crisis")).toBe(pistachioBefore);
  });
});
