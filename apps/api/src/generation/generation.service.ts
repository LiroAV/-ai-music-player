import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { PrismaService } from '../prisma/prisma.service'
import { PromptBuilderService } from './prompt-builder.service'
import type { GenerationRequest, GenerationResponse } from '@music-gem2/types'

const REUSE_QUALITY_THRESHOLD = 0.6
const MIN_REUSE_COUNT = 3

@Injectable()
export class GenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promptBuilder: PromptBuilderService,
    @InjectQueue('generation') private readonly queue: Queue,
  ) {}

  async request(userId: string, req: GenerationRequest): Promise<GenerationResponse> {
    const structured = this.promptBuilder.build(req)

    // Step 1: search existing library first (reuse-first architecture)
    const candidates = await this.prisma.track.findMany({
      where: {
        status: 'ready_public',
        visibility: 'public',
        moderationStatus: 'approved',
        qualityScore: { gte: REUSE_QUALITY_THRESHOLD },
        ...(structured.primaryGenre ? { primaryGenre: structured.primaryGenre } : {}),
      },
      orderBy: [{ qualityScore: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    })

    // Filter out recently played by this user
    const recentEvents = await this.prisma.listeningEvent.findMany({
      where: { userId, eventType: { in: ['play', 'complete'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { trackId: true },
    })
    const recentIds = new Set(recentEvents.map(e => e.trackId))
    const fresh = candidates.filter(t => !recentIds.has(t.id))

    if (fresh.length >= MIN_REUSE_COUNT) {
      return {
        mode: 'reused_existing_tracks',
        tracks: fresh.slice(0, 10).map(t => t.id),
        generationJob: null,
        message: 'Found matching tracks in library',
      }
    }

    // Step 2: check user generation allowance
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    const canGenerate = user.subscriptionTier !== 'free' || (await this.checkFreeGenerationAllowance(userId))

    if (!canGenerate) {
      const broadened = candidates.slice(0, 5)
      return {
        mode: 'broadened_search',
        tracks: broadened.map(t => t.id),
        generationJob: null,
        message: 'Using similar tracks from library',
      }
    }

    // Step 3: create generation job
    const textPrompt = this.promptBuilder.toTextPrompt(structured)
    const job = await this.prisma.generationJob.create({
      data: {
        userId,
        status: 'pending',
        inputPrompt: req.freeTextPrompt ?? textPrompt,
        structuredPromptJson: structured as any,
        provider: process.env['GENERATION_PROVIDER'] ?? 'mock',
        estimatedCost: 0.05,
      },
    })

    await this.queue.add('generate', { jobId: job.id }, { attempts: 3, backoff: 5000 })

    return {
      mode: 'generation_started',
      tracks: fresh.map(t => t.id),
      generationJob: job as any,
      message: 'Generating a new track — existing matches playing while you wait',
    }
  }

  async getJob(jobId: string, userId: string) {
    return this.prisma.generationJob.findFirstOrThrow({
      where: { id: jobId, userId },
      include: { resultTrack: true },
    })
  }

  private async checkFreeGenerationAllowance(userId: string): Promise<boolean> {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const count = await this.prisma.generationJob.count({
      where: { userId, createdAt: { gte: dayAgo }, status: { in: ['completed', 'processing', 'queued', 'pending'] } },
    })
    return count < 3  // free users get 3 generations per day
  }
}
