import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from './auth.service'

export interface JwtPayload {
  sub: string    // Supabase user id
  email: string
  role: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env['SUPABASE_JWT_SECRET']!,
      ignoreExpiration: false,
    })
  }

  async validate(payload: JwtPayload) {
    return this.authService.syncUser(payload.sub, payload.email)
  }
}
