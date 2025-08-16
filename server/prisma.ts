import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma
  = globalForPrisma.prisma
    || new PrismaClient({
      log: ['error', 'warn', 'info'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
        },
      },
    })

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma
