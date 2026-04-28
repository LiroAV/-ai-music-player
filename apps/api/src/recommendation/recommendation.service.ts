import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { Track } from '@ai-music-player/db'

const EVENT_WEIGHTS: Record<string, number> = {
  like: 5,
  save: 6,
  add_to_playlist: 8,
  complete: 3,
  replay: 7,
  skip: -3,
  dislike: -8,
  rate: 0,
  play: 0,
  pause: 0,
  unsave: -4,
  remove_from_playlist: -4,
  share: 4,
  report: -10,
}

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPersonalizedFeed(userId: string, limit: number) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } })
    const tasteVector = (profile?.tasteVectorJson ?? {}) as Record<string, number>

    // Tracks recently played (last 50) to avoid repetition
    const recentEvents = await this.prisma.listeningEvent.findMany({
      where: { userId, eventType: { in: ['play', 'complete'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { trackId: true },
    })
    const recentIds = [...new Set(recentEvents.map(e => e.trackId))]

    // Personalized portion (70%)
    const personalizedCount = Math.floor(limit * 0.70)
    const adjacentCount = Math.floor(limit * 0.20)
    const exploratoryCount = limit - personalizedCount - adjacentCount

    const topGenres = Object.entries(tasteVector)
      .filter(([k]) => k.startsWith('genre:'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => k.replace('genre:', ''))

    const topMoods = Object.entries(tasteVector)
      .filter(([k]) => k.startsWith('mood:'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => k.replace('mood:', ''))

    const baseFilter = {
      status: 'ready_public' as const,
      visibility: 'public' as const,
      moderationStatus: 'approved' as const,
      id: { notIn: recentIds },
    }

    const [personalized, adjacent, exploratory] = await Promise.all([
      // Personalized: match top genres or moods
      this.prisma.track.findMany({
        where: {
          ...baseFilter,
          ...((topGenres.length > 0 || topMoods.length > 0) ? {
            OR: [
              ...(topGenres.length > 0 ? [{ primaryGenre: { in: topGenres } }] : []),
              ...(topMoods.length > 0 ? topMoods.map(m => ({ moodsJson: { string_contains: m } })) : []),
            ],
          } : {}),
        },
        orderBy: [{ qualityScore: 'desc' }, { createdAt: 'desc' }],
        take: personalizedCount,
      }),

      // Adjacent: different genres, but might share moods
      this.prisma.track.findMany({
        where: {
          ...baseFilter,
          ...(topGenres.length > 0 ? { primaryGenre: { notIn: topGenres } } : {}),
        },
        orderBy: { qualityScore: 'desc' },
        take: adjacentCount,
      }),

      // Exploratory: random high-quality
      this.prisma.track.findMany({
        where: {
          status: 'ready_public',
          visibility: 'public',
          moderationStatus: 'approved',
          id: { notIn: recentIds },
          qualityScore: { gte: 0.7 },
        },
        orderBy: { createdAt: 'desc' },
        take: exploratoryCount,
      }),
    ])

    // Interleave: P P P A P P P A E ...
    const combined: Track[] = []
    let pi = 0, ai = 0, ei = 0
    for (let i = 0; i < limit; i++) {
      if (i % 10 < 7 && pi < personalized.length) combined.push(personalized[pi++]!)
      else if (i % 10 < 9 && ai < adjacent.length) combined.push(adjacent[ai++]!)
      else if (ei < exploratory.length) combined.push(exploratory[ei++]!)
      else if (pi < personalized.length) combined.push(personalized[pi++]!)
    }

    return combined.map(t => ({
      ...t,
      recommendationReason: this.buildReason(t, topGenres, topMoods),
    }))
  }

  async getDiscoverFeed(userId: string, limit: number) {
    const recentEvents = await this.prisma.listeningEvent.findMany({
      where: { userId },
      select: { trackId: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    const seenIds = [...new Set(recentEvents.map(e => e.trackId))]

    return this.prisma.track.findMany({
      where: {
        status: 'ready_public',
        visibility: 'public',
        moderationStatus: 'approved',
        id: { notIn: seenIds },
        qualityScore: { gte: 0.65 },
      },
      orderBy: [{ qualityScore: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    })
  }

  async updateTasteProfile(
    userId: string,
    track: Track,
    eventType: string,
    positionSeconds?: number,
  ) {
    const baseWeight = EVENT_WEIGHTS[eventType] ?? 0

    // Adjust skip weight by position
    let weight = baseWeight
    if (eventType === 'skip' && positionSeconds !== undefined) {
      weight = positionSeconds < 10 ? -5 : positionSeconds < 30 ? -3 : -1
    }

    if (weight === 0) return

    const profile = await this.prisma.userProfile.findUnique({ where: { userId } })
    const tasteVector = (profile?.tasteVectorJson ?? {}) as Record<string, number>

    // Update genre weight
    const genreKey = `genre:${track.primaryGenre}`
    tasteVector[genreKey] = this.updateWeight(tasteVector[genreKey] ?? 0.5, weight)

    // Update mood weights
    const moods = (track.moodsJson as string[]) ?? []
    for (const mood of moods) {
      const moodKey = `mood:${mood}`
      tasteVector[moodKey] = this.updateWeight(tasteVector[moodKey] ?? 0.5, weight)
    }

    await this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, tasteVectorJson: tasteVector, lastUpdatedAt: new Date() },
      update: { tasteVectorJson: tasteVector, lastUpdatedAt: new Date() },
    })
  }

  private updateWeight(current: number, delta: number): number {
    const learningRate = 0.05
    const normalized = delta / 10  // delta is in range -10..+10, normalize to -1..+1
    const updated = current + learningRate * normalized
    return Math.max(0, Math.min(1, updated))
  }

  private buildReason(track: Track, topGenres: string[], topMoods: string[]): string | null {
    if (topGenres.includes(track.primaryGenre)) {
      return `Because you enjoy ${track.primaryGenre}`
    }
    const trackMoods = (track.moodsJson as string[]) ?? []
    const sharedMood = trackMoods.find(m => topMoods.includes(m))
    if (sharedMood) {
      return `Matches your ${sharedMood} mood`
    }
    return null
  }
}

