import { PrismaClient } from "@prisma/client";

// Évite de créer plusieurs connexions en développement (rechargement à chaud)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
