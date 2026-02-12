import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Extend Prisma client to include designHistory model at runtime
export const prisma = db.$extends({
  model: {
    designHistory: {
      findMany: async (args: any) => {
        return db.$queryRaw`
          SELECT * FROM "DesignHistory" 
          WHERE "userId" = ${args.where?.userId}
          ${args.where?.type ? `AND type = ${args.where.type}` : ''}
          ORDER BY "createdAt" DESC
          LIMIT ${args.take || 20}
        `
      },
      create: async (args: any) => {
        const { userId, designSystemId, name, description, prompt, type } = args.data
        return db.$queryRaw`
          INSERT INTO "DesignHistory" ("id", "userId", "designSystemId", "name", "description", "prompt", "type", "createdAt")
          VALUES (LOWER(HEX(RANDOMBLOB(16))), ${userId}, ${designSystemId || null}, ${name}, ${description || null}, ${prompt}, ${type || 'design-system'}, datetime('now'))
          RETURNING *
        `
      },
      deleteMany: async (args: any) => {
        const result = await db.$queryRaw`DELETE FROM "DesignHistory" WHERE "userId" = ${args.where?.userId}` as any
        return { count: Number((result as any)?.changes || 0) }
      }
    }
  }
})
