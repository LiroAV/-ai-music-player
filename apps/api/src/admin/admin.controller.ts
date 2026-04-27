import { Controller, Get, Post, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { AdminService } from './admin.service'

class ModerateDto {
  @IsIn(['approve', 'reject', 'archive'])
  action!: 'approve' | 'reject' | 'archive'
}

@ApiTags('admin')
@Controller('admin')
// TODO: add admin guard (check user role in JWT or DB)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('metrics')
  getMetrics() {
    return this.admin.getMetrics()
  }

  @Get('tracks')
  getTracks(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.admin.getTracks(limit, offset)
  }

  @Post('tracks/:id/moderate')
  moderate(@Param('id') id: string, @Body() dto: ModerateDto) {
    return this.admin.moderateTrack(id, dto.action)
  }

  @Get('jobs')
  getJobs(@Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number) {
    return this.admin.getGenerationJobs(limit)
  }
}
