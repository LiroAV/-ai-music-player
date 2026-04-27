import { Module } from '@nestjs/common'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'
import { RecommendationModule } from '../recommendation/recommendation.module'

@Module({
  imports: [RecommendationModule],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
