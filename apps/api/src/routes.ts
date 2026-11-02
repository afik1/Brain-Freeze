import { Router, Request, Response, NextFunction } from "express";
import { storeInfo, flavors, categories, nextOrderId } from "./data.js";
import { AppError } from "./errors.js";
import type { OrderRequest, OrderResponseItem } from "./types.js";

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

      responseItems.push({
        flavorId: flavor.id,
        name: flavor.name,
        quantity: item.quantity,
        unitPrice: flavor.price,
        subtotal: Math.round(flavor.price * item.quantity * 100) / 100,
      });
    }

    const total =
      Math.round(
        responseItems.reduce((sum, i) => sum + i.subtotal, 0) * 100
      ) / 100;

    res.status(201).json({
      orderId: nextOrderId(),
      status: "confirmed",
      total,
      items: responseItems,
    });
  }
);
