import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async me(@Request() req: { user: { id: string } }) {
    return this.authService.getMe(req.user.id)
  }
}
