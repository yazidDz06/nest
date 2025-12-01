import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

const cookieExtractor = (req: Request) => req?.cookies?.['access_token'] || null;

@Injectable()
//here i will extract+verify jwt and making req.user
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // payload.sub = userId
    return { sub: payload.sub,
       email: payload.email,
        role: payload.role };
  }
  //if validated it will be req.user on my controller
}
//notice: await this.authService.removeRefreshToken(user.sub); using sub on validating payload so using sub on auth controller