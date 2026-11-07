import express from "express";
import cors from "cors";
import { router } from "./routes.js";
import { errorHandler } from "./errors.js";
export { resetData } from "./data.js";

const PORT = Number(process.env["PORT"] ?? 3001);
const DELAY_MIN = Number(process.env["DELAY_MIN_MS"] ?? 150);
const DELAY_MAX = Number(process.env["DELAY_MAX_MS"] ?? 350);

function artificialDelay(_req: express.Request, _res: express.Response, next: express.NextFunction): void {
  const ms = DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1));
  setTimeout(next, ms);
}

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: process.env["CORS_ORIGIN"] ?? "http://localhost:5173",
      methods: ["GET", "POST", "OPTIONS"],
    })
  );

  app.use(express.json());
  app.use(artificialDelay);
  app.use(router);
  app.use(errorHandler);

  return app;
}

// Only start the server when this file is run directly
// (not when imported by tests)
const isMain =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith("index.ts") ||
    process.argv[1].endsWith("index.js"));

if (isMain) {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`🍦 Brain Freeze API running at http://localhost:${PORT}`);
    console.log(`   Artificial delay: ${DELAY_MIN}–${DELAY_MAX} ms`);
  });
}
