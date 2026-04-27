import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } })
    const tasteVector = (profile?.tasteVectorJson ?? {}) as Record<string, number>

    const genres = Object.entries(tasteVector)
      .filter(([k]) => k.startsWith('genre:'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([k, v]) => ({ genre: k.replace('genre:', ''), score: v }))

    const moods = Object.entries(tasteVector)
      .filter(([k]) => k.startsWith('mood:'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([k, v]) => ({ mood: k.replace('mood:', ''), score: v }))

    return { ...profile, topGenres: genres, topMoods: moods, summary: this.buildSummary(genres, moods) }
  }

  async completeOnboarding(userId: string, selectedStyles: string[], selectedMoods: string[]) {
    const tasteVector: Record<string, number> = {}

    for (const style of selectedStyles) {
      tasteVector[`genre:${style}`] = 0.7
    }
    for (const mood of selectedMoods) {
      tasteVector[`mood:${mood}`] = 0.7
    }

    await this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, tasteVectorJson: tasteVector, lastUpdatedAt: new Date() },
      update: { tasteVectorJson: tasteVector, lastUpdatedAt: new Date() },
    })

    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    })

    return { completed: true }
  }

  private buildSummary(
    genres: Array<{ genre: string; score: number }>,
    moods: Array<{ mood: string; score: number }>,
  ): string {
    if (genres.length === 0) return 'Your taste profile is still forming. Keep listening!'
    const topGenres = genres.slice(0, 3).map(g => g.genre).join(', ')
    const topMoods = moods.slice(0, 2).map(m => m.mood).join(' and ')
    return `You mostly enjoy ${topMoods ? topMoods + ', ' : ''}${topGenres} music.`
  }
}
