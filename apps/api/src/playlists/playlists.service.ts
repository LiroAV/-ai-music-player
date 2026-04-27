import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePlaylistDto } from './dto/create-playlist.dto'

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: { _count: { select: { tracks: true } } },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async create(userId: string, dto: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        visibility: dto.visibility ?? 'private',
      },
    })
  }

  async findOne(id: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: {
          include: { track: true },
          orderBy: { position: 'asc' },
        },
      },
    })
    if (!playlist) throw new NotFoundException('Playlist not found')
    if (playlist.visibility === 'private' && playlist.userId !== userId) {
      throw new ForbiddenException()
    }
    return playlist
  }

  async update(id: string, userId: string, dto: Partial<CreatePlaylistDto>) {
    const playlist = await this.prisma.playlist.findUniqueOrThrow({ where: { id } })
    if (playlist.userId !== userId) throw new ForbiddenException()
    return this.prisma.playlist.update({ where: { id }, data: dto })
  }

  async remove(id: string, userId: string) {
    const playlist = await this.prisma.playlist.findUniqueOrThrow({ where: { id } })
    if (playlist.userId !== userId) throw new ForbiddenException()
    await this.prisma.playlist.delete({ where: { id } })
    return { deleted: true }
  }

  async addTracks(playlistId: string, userId: string, trackIds: string[]) {
    const playlist = await this.prisma.playlist.findUniqueOrThrow({ where: { id: playlistId } })
    if (playlist.userId !== userId) throw new ForbiddenException()

    const last = await this.prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
    })
    let pos = (last?.position ?? 0) + 1

    for (const trackId of trackIds) {
      await this.prisma.playlistTrack.upsert({
        where: { playlistId_trackId: { playlistId, trackId } },
        create: { playlistId, trackId, position: pos++ },
        update: {},
      })
    }
    return { added: trackIds.length }
  }

  async removeTrack(playlistId: string, userId: string, trackId: string) {
    const playlist = await this.prisma.playlist.findUniqueOrThrow({ where: { id: playlistId } })
    if (playlist.userId !== userId) throw new ForbiddenException()
    await this.prisma.playlistTrack.deleteMany({ where: { playlistId, trackId } })
    return { removed: true }
  }
}
