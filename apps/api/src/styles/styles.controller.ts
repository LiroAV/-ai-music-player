import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { StylesService } from './styles.service'

@ApiTags('styles')
@Controller('styles')
export class StylesController {
  constructor(private readonly styles: StylesService) {}

  @Get()
  findAll() {
    return this.styles.findAll()
  }

  @Get('followed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFollowed(@Request() req: { user: { id: string } }) {
    return this.styles.getFollowedStyles(req.user.id)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.styles.findOne(id, req.user.id)
  }

  @Get(':id/related')
  findRelated(@Param('id') id: string) {
    return this.styles.findRelated(id)
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  follow(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.styles.follow(req.user.id, id)
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unfollow(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.styles.unfollow(req.user.id, id)
  }
}
