import { Processor, Process } from '@nestjs/bull'
import { Logger, Inject } from '@nestjs/common'
import { Job } from 'bull'
import { PrismaService } from '../prisma/prisma.service'
import type { IGenerationProvider } from './providers/mock.provider'
import type { StructuredPrompt } from '@ai-music-player/types'
import { PromptBuilderService } from './prompt-builder.service'

@Processor('generation')
export class GenerationProcessor {
  private readonly logger = new Logger(GenerationProcessor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly promptBuilder: PromptBuilderService,
    @Inject('GENERATION_PROVIDER') private readonly provider: IGenerationProvider,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<{ jobId: string }>) {
    const { jobId } = job.data
    this.logger.log(`Processing generation job ${jobId}`)

    await this.prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'processing', startedAt: new Date() },
    })

    try {
      const generationJob = await this.prisma.generationJob.findUniqueOrThrow({ where: { id: jobId } })
      const structured = generationJob.structuredPromptJson as unknown as StructuredPrompt
      const textPrompt = this.promptBuilder.toTextPrompt(structured)

      const result = await this.provider.generate(structured, textPrompt)

      // Create track from result
      const track = await this.prisma.track.create({
        data: {
          title: this.generateTitle(structured),
          artistName: this.generateArtistName(),
          audioUrl: result.audioUrl,
          durationSeconds: result.durationSeconds,
          status: 'ready_public',
          visibility: 'public',
          createdByUserId: generationJob.userId,
          generationJobId: jobId,
          primaryGenre: structured.primaryGenre,
          subgenresJson: structured.subgenres,
          moodsJson: structured.moods,
          attributesJson: {
            bpm: (structured.bpmRange[0] + structured.bpmRange[1]) / 2,
            energy: structured.energy,
            tempo: structured.tempo,
            instruments: structured.instruments,
            vocals: structured.vocals,
            danceability: structured.energy * 0.8,
            complexity: structured.complexity,
            brightness: 0.5,
            acousticBalance: 0.5,
            loopable: false,
            activitySuitability: [],
          },
          qualityScore: 0.5,  // starts neutral, updated by engagement
          moderationStatus: 'approved',
        },
      })

      await this.prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          actualCost: this.provider.estimateCost(result.durationSeconds),
        },
      })

      this.logger.log(`Generation job ${jobId} completed → track ${track.id}`)
    } catch (err) {
      this.logger.error(`Generation job ${jobId} failed: ${err}`)
      await this.prisma.generationJob.update({
        where: { id: jobId },
        data: { status: 'failed', errorMessage: String(err) },
      })
      throw err
    }
  }

  private generateTitle(prompt: StructuredPrompt): string {
    const mood = prompt.moods[0] ?? 'warm'
    const genre = prompt.primaryGenre
    const adjectives = ['Midnight', 'Soft', 'Deep', 'Slow', 'Blue', 'Golden', 'Distant', 'Quiet']
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]!
    return `${adj} ${mood.charAt(0).toUpperCase() + mood.slice(1)} ${genre.charAt(0).toUpperCase() + genre.slice(1)}`
  }

  private generateArtistName(): string {
    const first = ['North', 'Echo', 'Void', 'Azure', 'Crest', 'Lumen', 'Axis', 'Sol']
    const second = ['Meridian', 'Collective', 'Studio', 'Soundworks', 'Audio', 'Project', 'Lab']
    const f = first[Math.floor(Math.random() * first.length)]!
    const s = second[Math.floor(Math.random() * second.length)]!
    return `${f} ${s}`
  }
}
