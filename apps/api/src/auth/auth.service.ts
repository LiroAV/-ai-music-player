import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SupabaseService } from './supabase.service'
import type { User } from '@music-gem2/db'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async syncUser(supabaseUserId: string, email: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { id: supabaseUserId } })
    if (existing) return existing

    const username = email.split('@')[0]!.replace(/[^a-z0-9]/gi, '') + Math.floor(Math.random() * 9999)

    return this.prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        username,
        profile: { create: {} },
      },
    })
  }

  async getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true },
    })
  }
}
