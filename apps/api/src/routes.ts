import { Router, Request, Response, NextFunction } from "express";
import {
  storeInfo,
  flavors,
  categories,
  sizes,
  toppings,
  DEFAULT_SIZE_ID,
  nextOrderId,
} from "./data.js";
import { AppError } from "./errors.js";
import type { OrderRequest, OrderResponseItem, Topping } from "./types.js";

export const router = Router();

// ── GET /health ─────────────────────────────────────────────────────────────
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── GET /api/store ───────────────────────────────────────────────────────────
router.get("/api/store", (_req: Request, res: Response) => {
  res.json(storeInfo);
});

// ── GET /api/categories ──────────────────────────────────────────────────────
router.get("/api/categories", (_req: Request, res: Response) => {
  res.json(categories);
});

// ── GET /api/sizes ───────────────────────────────────────────────────────────
router.get("/api/sizes", (_req: Request, res: Response) => {
  res.json(sizes);
});

// ── GET /api/toppings ────────────────────────────────────────────────────────
router.get("/api/toppings", (_req: Request, res: Response) => {
  res.json(toppings);
});

// ── GET /api/flavors ─────────────────────────────────────────────────────────
router.get("/api/flavors", (_req: Request, res: Response) => {
  res.json(flavors);
});

// ── GET /api/flavors/:id ─────────────────────────────────────────────────────
router.get(
  "/api/flavors/:id",
  (req: Request, res: Response, next: NextFunction) => {
    const flavor = flavors.find((f) => f.id === req.params["id"]);
    if (!flavor) {
      return next(
        new AppError(
          404,
          "FLAVOR_NOT_FOUND",
          `No flavor found with id "${req.params["id"]}".`
        )
      );
    }
    res.json(flavor);
  }
);

// ── POST /api/orders ─────────────────────────────────────────────────────────
const round2 = (n: number): number => Math.round(n * 100) / 100;

router.post(
  "/api/orders",
  (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as OrderRequest;

    // Validate top-level shape
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return next(
        new AppError(
          400,
          "INVALID_ORDER",
          "An order must contain at least one item."
        )
      );
    }

    const responseItems: OrderResponseItem[] = [];
    const requestedByFlavor = new Map<string, number>();

    // Phase 1: validate everything. Nothing is mutated in this phase.
    for (const item of body.items) {
      // Validate quantity
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return next(
          new AppError(
            400,
            "INVALID_QUANTITY",
            `Quantity must be a positive integer. Received: ${item.quantity}`
          )
        );
      }

      // Validate flavor exists
      const flavor = flavors.find((f) => f.id === item.flavorId);
      if (!flavor) {
        return next(
          new AppError(
            400,
            "FLAVOR_NOT_FOUND",
            `Unknown flavor id: "${item.flavorId}".`
          )
        );
      }

      // Validate flavor is available
      if (!flavor.isAvailable) {
        return next(
          new AppError(
            400,
            "FLAVOR_UNAVAILABLE",
            `"${flavor.name}" is currently unavailable.`
          )
        );
      }

      // Validate size (optional, defaults to regular)
      const sizeId = item.sizeId ?? DEFAULT_SIZE_ID;
      const size = sizes.find((s) => s.id === sizeId);
      if (!size) {
        return next(
          new AppError(
            400,
            "INVALID_SIZE",
            `Unknown size id: "${String(sizeId)}". Valid sizes: ${sizes
              .map((s) => s.id)
              .join(", ")}.`
          )
        );
      }

      // Validate toppings (optional, defaults to none)
      const toppingIds = item.toppingIds ?? [];
      if (
        !Array.isArray(toppingIds) ||
        toppingIds.some((id) => typeof id !== "string")
      ) {
        return next(
          new AppError(
            400,
            "INVALID_ORDER",
            "toppingIds must be an array of topping ids."
          )
        );
      }

      const chosenToppings: Topping[] = [];
      for (const toppingId of toppingIds) {
        if (chosenToppings.some((t) => t.id === toppingId)) {
          return next(
            new AppError(
              400,
              "DUPLICATE_TOPPING",
              `Topping "${toppingId}" was selected more than once for "${flavor.name}".`
            )
          );
        }
        const topping = toppings.find((t) => t.id === toppingId);
        if (!topping) {
          return next(
            new AppError(
              400,
              "TOPPING_NOT_FOUND",
              `Unknown topping id: "${toppingId}".`
            )
          );
        }
        if (!topping.isAvailable) {
          return next(
            new AppError(
              400,
              "TOPPING_UNAVAILABLE",
              `"${topping.name}" is currently unavailable.`
            )
          );
        }
        chosenToppings.push(topping);
      }

      // Server-side pricing: base + size modifier + toppings
      const toppingsTotal = chosenToppings.reduce((sum, t) => sum + t.price, 0);
      const unitPrice = round2(flavor.price + size.priceModifier + toppingsTotal);

      requestedByFlavor.set(
        flavor.id,
        (requestedByFlavor.get(flavor.id) ?? 0) + item.quantity
      );

      responseItems.push({
        flavorId: flavor.id,
        name: flavor.name,
        quantity: item.quantity,
        size,
        toppings: chosenToppings.map((t) => ({
          id: t.id,
          name: t.name,
          price: t.price,
        })),
        basePrice: flavor.price,
        unitPrice,
        subtotal: round2(unitPrice * item.quantity),
      });
    }

    // Check stock against the TOTAL requested per flavor across all items
    for (const [flavorId, requested] of requestedByFlavor) {
      const flavor = flavors.find((f) => f.id === flavorId)!;
      if (requested > flavor.stockRemaining) {
        return next(
          new AppError(
            400,
            "INSUFFICIENT_STOCK",
            `Only ${flavor.stockRemaining} of "${flavor.name}" remaining, but ${requested} requested.`
          )
        );
      }
    }

    // Phase 2: the whole order is valid, so now decrement stock.
    for (const [flavorId, requested] of requestedByFlavor) {
      const flavor = flavors.find((f) => f.id === flavorId)!;
      flavor.stockRemaining -= requested;
      if (flavor.stockRemaining === 0) {
        flavor.isAvailable = false; // keep isAvailable consistent with stock
      }
    }

    const total = round2(responseItems.reduce((sum, i) => sum + i.subtotal, 0));

    res.status(201).json({
      orderId: nextOrderId(),
      status: "confirmed",
      total,
      items: responseItems,
    });
  }
);
