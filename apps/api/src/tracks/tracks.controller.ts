import {
  Controller, Get, Post, Delete, Param, Body, Query,
  UseGuards, Request, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { TracksService } from './tracks.service'
import { PlayEventDto, RateTrackDto } from './dto/play-event.dto'

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracks: TracksService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false })
  getFeed(
    @Request() req: { user: { id: string } },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.tracks.getFeed(req.user.id, limit)
  }

  @Get('discover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getDiscover(
    @Request() req: { user: { id: string } },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.tracks.getDiscover(req.user.id, limit)
  }

  @Get('liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getLiked(
    @Request() req: { user: { id: string } },
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.tracks.getLikedTracks(req.user.id, limit)
  }

  @Get('recently-played')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getRecentlyPlayed(
    @Request() req: { user: { id: string } },
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.tracks.getRecentlyPlayed(req.user.id, limit)
  }

  @Get('by-style/:styleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getByStyle(
    @Param('styleId') styleId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.tracks.getByStyle(styleId, limit)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getById(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tracks.getById(id, req.user.id)
  }

  @Post(':id/play-event')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  playEvent(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: PlayEventDto,
  ) {
    return this.tracks.recordPlayEvent(id, req.user.id, dto)
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  like(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tracks.likeTrack(id, req.user.id)
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unlike(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tracks.unlikeTrack(id, req.user.id)
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  rate(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: RateTrackDto,
  ) {
    return this.tracks.rateTrack(id, req.user.id, dto.rating)
  }
}
