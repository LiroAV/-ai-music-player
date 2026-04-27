import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [userCount, trackCount, jobCount, totalPlays, totalLikes] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.track.count({ where: { status: 'ready_public' } }),
      this.prisma.generationJob.count(),
      this.prisma.listeningEvent.count({ where: { eventType: 'play' } }),
      this.prisma.like.count(),
    ])

    const jobsByStatus = await this.prisma.generationJob.groupBy({
      by: ['status'],
      _count: true,
    })

    const costStats = await this.prisma.generationJob.aggregate({
      _sum: { actualCost: true },
      _avg: { actualCost: true },
      where: { status: 'completed' },
    })

    return {
      users: userCount,
      tracks: trackCount,
      generationJobs: jobCount,
      totalPlays,
      totalLikes,
      jobsByStatus,
      totalGenerationCost: costStats._sum.actualCost ?? 0,
      avgCostPerJob: costStats._avg.actualCost ?? 0,
    }
  }

  async getTracks(limit = 50, offset = 0) {
    return this.prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: { select: { likes: true, listeningEvents: true } },
        generationJob: { select: { id: true, provider: true, actualCost: true } },
      },
    })
  }

  async moderateTrack(trackId: string, action: 'approve' | 'reject' | 'archive') {
    const statusMap = {
      approve: { moderationStatus: 'approved' as const, status: 'ready_public' as const },
      reject: { moderationStatus: 'rejected' as const, status: 'rejected' as const },
      archive: { moderationStatus: 'approved' as const, status: 'archived' as const },
    }
    return this.prisma.track.update({ where: { id: trackId }, data: statusMap[action] })
  }

  async getGenerationJobs(limit = 50) {
    return this.prisma.generationJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { email: true, username: true } }, resultTrack: true },
    })
  }
}
