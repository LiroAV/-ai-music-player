import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { GenerationService } from './generation.service'
import type { GenerationRequest } from '@music-gem2/types'

@ApiTags('generation')
@Controller('generate')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GenerationController {
  constructor(private readonly generation: GenerationService) {}

  @Post('request')
  request(@Request() req: { user: { id: string } }, @Body() body: GenerationRequest) {
    return this.generation.request(req.user.id, body)
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.generation.getJob(id, req.user.id)
  }
}
