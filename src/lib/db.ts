import { PrismaClient } from "@/generated/prisma/client";

// TIPS: Use global instance to avoid development hot-reloading create repeat clients issues.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
