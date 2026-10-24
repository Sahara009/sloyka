import "server-only";
import { PrismaClient } from "@prisma/client";

/** База подключена, если задан DATABASE_URL. Без него сайт работает на данных из src/data */
export const hasDb = Boolean(process.env.DATABASE_URL);

const g = globalThis as unknown as { prisma?: PrismaClient };

/** Один клиент на всё приложение (в dev Next перезагружает модули — не плодим соединения) */
export function db(): PrismaClient {
  if (!hasDb) throw new Error("DATABASE_URL не задан — база не подключена");
  if (!g.prisma) g.prisma = new PrismaClient();
  return g.prisma;
}
