import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access') {
 constructor(config: ConfigService) {
  const secret = config.get<string>('JWT_ACCESS_SECRET')
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined')
  
  super({
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req: Request) => req?.cookies?.access_token ?? null,
    ]),
    secretOrKey: secret,
  })
}
// payload.sub = userId
  validate(payload: { sub: number; email: string; role: string }) {
    return payload
  }
}