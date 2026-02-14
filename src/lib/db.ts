import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// The DesignHistory model is already defined in prisma/schema.prisma
// Use db.designHistory directly with Prisma's built-in methods:
// - db.designHistory.findMany()
// - db.designHistory.create()
// - db.designHistory.deleteMany()
// No custom extension needed - Prisma handles PostgreSQL compatibility automatically
