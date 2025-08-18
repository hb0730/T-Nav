export class BackupService {
  async exportDatabaseData(): Promise<any> {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const [users, categories, links, friendLinks, siteConfig, friendLinkSubmissions, linkSubmissions] = await Promise.all([
        prisma.user.findMany(),
        prisma.category.findMany(),
        prisma.link.findMany(),
        prisma.friendLink.findMany(),
        prisma.siteConfig.findMany(),
        prisma.friendLinkSubmission.findMany(),
        prisma.linkSubmission.findMany(),
      ])

      return {
        users,
        categories,
        links,
        friendLinks,
        siteConfig,
        friendLinkSubmissions,
        linkSubmissions,
        exportedAt: new Date().toISOString(),
      }
    }
    finally {
      await prisma.$disconnect()
    }
  }
}

export const backupService = new BackupService()
