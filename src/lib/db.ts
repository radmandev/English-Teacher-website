import { PrismaClient } from "@prisma/client";

// Prisma's engine sizes its thread pool to the core count; on shared hosting that alone uses ~50 of the
// account's ~120 threads. Read when the engine loads, so this works even if the host skips `npm start`.
process.env.TOKIO_WORKER_THREADS ??= "2";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;
