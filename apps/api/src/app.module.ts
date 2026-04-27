import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { BullModule } from '@nestjs/bull'
import { AuthModule } from './auth/auth.module'
import { TracksModule } from './tracks/tracks.module'
import { StylesModule } from './styles/styles.module'
import { PlaylistsModule } from './playlists/playlists.module'
import { GenerationModule } from './generation/generation.module'
import { UserProfilesModule } from './user-profiles/user-profiles.module'
import { RecommendationModule } from './recommendation/recommendation.module'
import { AdminModule } from './admin/admin.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000,
      limit: 20,
    }, {
      name: 'long',
      ttl: 60000,
      limit: 300,
    }]),

    BullModule.forRoot({
      redis: {
        host: process.env['REDIS_HOST'] ?? 'localhost',
        port: parseInt(process.env['REDIS_PORT'] ?? '6379'),
        password: process.env['REDIS_PASSWORD'],
      },
    }),

    PrismaModule,
    AuthModule,
    TracksModule,
    StylesModule,
    PlaylistsModule,
    GenerationModule,
    UserProfilesModule,
    RecommendationModule,
    AdminModule,
  ],
})
export class AppModule {}
