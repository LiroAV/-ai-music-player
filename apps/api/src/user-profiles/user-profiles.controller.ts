import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { IsArray, IsString } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UserProfilesService } from './user-profiles.service'

class OnboardingDto {
  @IsArray() @IsString({ each: true }) selectedStyles!: string[]
  @IsArray() @IsString({ each: true }) selectedMoods!: string[]
}

@ApiTags('user-profiles')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfilesController {
  constructor(private readonly profiles: UserProfilesService) {}

  @Get()
  getProfile(@Request() req: { user: { id: string } }) {
    return this.profiles.getProfile(req.user.id)
  }

  @Post('onboarding')
  completeOnboarding(@Request() req: { user: { id: string } }, @Body() dto: OnboardingDto) {
    return this.profiles.completeOnboarding(req.user.id, dto.selectedStyles, dto.selectedMoods)
  }
}
