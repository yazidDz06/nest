import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_REFRESH_SECRET')
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined')

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token ?? null,
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    })
  }
// payload.sub = userId
  validate(req: Request, payload: { sub: number; email: string; role: string }) {
    const refreshToken = req.cookies?.refresh_token
    return { ...payload, refreshToken }
  }
}

