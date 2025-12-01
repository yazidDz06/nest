import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
   constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async register(name:string, email:string, password:string){
      const hash = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({ email, name, password: hash });
      delete (user as any).password;
       delete (user as any).refreshTokenHash;
       return {
    message: "Utilisateur créé avec succès",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
  }
   async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }
  //getting token and signin token(sign in get secret and expiration from env file using config service)
  //here i will sign only the token without a name for the cookie where it will be stored like express(the cookie's name on strategy file)
   async getTokens(user: { id: number; email: string; role?: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role || 'USER' };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES') || '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES') || '7d',
    });
    return { accessToken, refreshToken };
  }
    // store refresh token hashé en DB (requires UsersService to implement updateRefreshToken)
  async storeRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }

  async removeRefreshToken(userId: number) {
    await this.usersService.removeRefreshToken(userId);
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      return payload;
    } catch (e) {
      return null;
    }
  }

  async validateRefreshTokenAgainstDb(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) return false;
    const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    return match;
  }
}
