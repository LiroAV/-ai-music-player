import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PlaylistsService } from './playlists.service'
import { CreatePlaylistDto, AddTracksDto } from './dto/create-playlist.dto'

@ApiTags('playlists')
@Controller('playlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaylistsController {
  constructor(private readonly playlists: PlaylistsService) {}

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.playlists.findAllForUser(req.user.id)
  }

  @Post()
  create(@Request() req: { user: { id: string } }, @Body() dto: CreatePlaylistDto) {
    return this.playlists.create(req.user.id, dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.playlists.findOne(id, req.user.id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: Partial<CreatePlaylistDto>,
  ) {
    return this.playlists.update(id, req.user.id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.playlists.remove(id, req.user.id)
  }

  @Post(':id/tracks')
  addTracks(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: AddTracksDto,
  ) {
    return this.playlists.addTracks(id, req.user.id, dto.trackIds)
  }

  @Delete(':id/tracks/:trackId')
  removeTrack(
    @Param('id') id: string,
    @Param('trackId') trackId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.playlists.removeTrack(id, req.user.id, trackId)
  }
}
