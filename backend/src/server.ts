import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";
import { validateEnvironment } from "./config/env";
import { ensureRuntimeDirectories } from "./config/paths";

validateEnvironment();
ensureRuntimeDirectories();

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "127.0.0.1";

const server = app.listen(PORT, HOST, () => {
  console.log(`MFS CRM backend listening on ${HOST}:${PORT}`);
});

const shutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received. Shutting down safely.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
