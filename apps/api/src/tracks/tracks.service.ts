import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RecommendationService } from '../recommendation/recommendation.service'
import type { ListeningEventType, Prisma } from '@ai-music-player/db'
import { PlayEventDto } from './dto/play-event.dto'

const PUBLIC_TRACK_FILTER: Prisma.TrackWhereInput = {
  status: 'ready_public',
  visibility: 'public',
  moderationStatus: 'approved',
}

@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendation: RecommendationService,
  ) {}

  async getFeed(userId: string, limit = 20) {
    const tracks = await this.recommendation.getPersonalizedFeed(userId, limit)
    return tracks
  }

  async getDiscover(userId: string, limit = 20) {
    return this.recommendation.getDiscoverFeed(userId, limit)
  }

  async getById(trackId: string, userId?: string) {
    const track = await this.prisma.track.findFirst({
      where: { id: trackId, ...PUBLIC_TRACK_FILTER },
    })
    if (!track) throw new NotFoundException('Track not found')

    const [likeCount, isLiked, userRating] = await Promise.all([
      this.prisma.like.count({ where: { trackId } }),
      userId ? this.prisma.like.findUnique({ where: { userId_trackId: { userId, trackId } } }) : null,
      userId ? this.prisma.rating.findUnique({ where: { userId_trackId: { userId, trackId } } }) : null,
    ])

    return { ...track, likeCount, isLiked: !!isLiked, userRating: userRating?.rating ?? null }
  }

  async getByStyle(styleId: string, limit = 20) {
    const style = await this.prisma.style.findUnique({ where: { id: styleId } })
    if (!style) throw new NotFoundException('Style not found')

    return this.prisma.track.findMany({
      where: {
        ...PUBLIC_TRACK_FILTER,
        OR: [
          { primaryGenre: style.slug },
          { moodsJson: { string_contains: style.slug } },
        ],
      },
      orderBy: { qualityScore: 'desc' },
      take: limit,
    })
  }

  async recordPlayEvent(trackId: string, userId: string, dto: PlayEventDto) {
    const track = await this.prisma.track.findUniqueOrThrow({ where: { id: trackId } })

    await this.prisma.listeningEvent.create({
      data: {
        userId,
        trackId,
        eventType: dto.eventType as ListeningEventType,
        positionSeconds: dto.positionSeconds ?? null,
        sessionId: dto.sessionId,
        contextJson: dto.context as unknown as Prisma.InputJsonValue,
      },
    })

    // Handle side-effect state mutations
    if (dto.eventType === 'like') {
      await this.prisma.like.upsert({
        where: { userId_trackId: { userId, trackId } },
        create: { userId, trackId },
        update: {},
      })
    } else if (dto.eventType === 'dislike') {
      await this.prisma.like.deleteMany({ where: { userId, trackId } })
    } else if (dto.eventType === 'save') {
      // saved tracks tracked via listeningEvent only for now
    } else if (dto.eventType === 'rate' && dto.rating) {
      await this.prisma.rating.upsert({
        where: { userId_trackId: { userId, trackId } },
        create: { userId, trackId, rating: dto.rating },
        update: { rating: dto.rating },
      })
    }

    // Update taste profile asynchronously
    await this.recommendation.updateTasteProfile(userId, track, dto.eventType, dto.positionSeconds)

    return { success: true }
  }

  async likeTrack(trackId: string, userId: string) {
    await this.prisma.track.findFirstOrThrow({ where: { id: trackId, ...PUBLIC_TRACK_FILTER } })
    await this.prisma.like.upsert({
      where: { userId_trackId: { userId, trackId } },
      create: { userId, trackId },
      update: {},
    })
    return { liked: true }
  }

  async unlikeTrack(trackId: string, userId: string) {
    await this.prisma.like.deleteMany({ where: { userId, trackId } })
    return { liked: false }
  }

  async rateTrack(trackId: string, userId: string, rating: number) {
    await this.prisma.track.findFirstOrThrow({ where: { id: trackId, ...PUBLIC_TRACK_FILTER } })
    await this.prisma.rating.upsert({
      where: { userId_trackId: { userId, trackId } },
      create: { userId, trackId, rating },
      update: { rating },
    })
    return { rating }
  }
}
