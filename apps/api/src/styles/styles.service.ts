import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class StylesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.style.findMany({
      orderBy: { popularityScore: 'desc' },
    })
  }

  async findOne(id: string, userId?: string) {
    const style = await this.prisma.style.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        _count: { select: { followedByUsers: true } },
      },
    })
    if (!style) throw new NotFoundException('Style not found')

    const isFollowed = userId
      ? !!(await this.prisma.userFollowedStyle.findUnique({
          where: { userId_styleId: { userId, styleId: id } },
        }))
      : false

    return { ...style, isFollowed, followerCount: style._count.followedByUsers }
  }

  async findRelated(id: string) {
    const style = await this.prisma.style.findUniqueOrThrow({ where: { id } })

    return this.prisma.style.findMany({
      where: {
        OR: [
          { parentStyleId: style.parentStyleId ?? id },
          { id: style.parentStyleId ?? undefined },
          { children: { some: { id } } },
        ],
        NOT: { id },
      },
      take: 8,
      orderBy: { popularityScore: 'desc' },
    })
  }

  async follow(userId: string, styleId: string) {
    await this.prisma.style.findUniqueOrThrow({ where: { id: styleId } })
    await this.prisma.userFollowedStyle.upsert({
      where: { userId_styleId: { userId, styleId } },
      create: { userId, styleId },
      update: {},
    })
    return { following: true }
  }

  async unfollow(userId: string, styleId: string) {
    await this.prisma.userFollowedStyle.deleteMany({ where: { userId, styleId } })
    return { following: false }
  }

  async getFollowedStyles(userId: string) {
    const followed = await this.prisma.userFollowedStyle.findMany({
      where: { userId },
      include: { style: true },
      orderBy: { createdAt: 'desc' },
    })
    return followed.map(f => f.style)
  }
}
