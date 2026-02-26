import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto, res: Response) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) throw new ConflictException('Email already in use')

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.usersService.create({ ...dto, password: hashedPassword })

    const tokens = await this.generateTokens(user.id, user.email, user.role)

  
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    this.attachCookies(res, tokens)

    return {
      message: 'Registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    }
  }

  async signIn(dto: SignInDto, res: Response) {
    const user = await this.usersService.findByEmail(dto.email)

    if (!user) throw new ForbiddenException('Invalid credentials')

    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) throw new ForbiddenException('Invalid credentials')

    if (user.statusUser === 'DISABLED') throw new ForbiddenException('Account disabled')

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    await this.storeRefreshToken(user.id, tokens.refreshToken)
    this.attachCookies(res, tokens)

    return {
      message: 'Signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }

 
  async signOut(userId: number, res: Response) {
    await this.usersService.removeRefreshToken(userId)
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return { message: 'Signed out successfully' }
  }

  // ─── Refresh
  // called when access token expired
  
  //here we compare to the stored refresh too
  //so we can know if a token is stoled

  async refreshTokens(userId: number, refreshToken: string, res: Response) {
    await this.validateRefreshTokenAgainstDb(userId, refreshToken)

    const user = await this.usersService.findById(userId);
    //user exists cause already verified by the funct validateRefreshTokenAgainstDb
    const tokens = await this.generateTokens(user!.id, user!.email, user!.role)
    await this.storeRefreshToken(user!.id, tokens.refreshToken)
    this.attachCookies(res, tokens)

    return { message: 'Tokens refreshed' }
  }



  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn:'15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:'7d',
      }),
    ])

    return { accessToken, refreshToken }
  }


  private async storeRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10)
    await this.usersService.updateRefreshToken(userId, hash)
  }



  private async validateRefreshTokenAgainstDb(userId: number, refreshToken: string) {
     const user = await this.usersService.findByIdWithRefreshToken(userId) 

    if (!user || !user.refreshTokenHash) throw new ForbiddenException('Access denied')

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash)

    if (!isMatch) throw new ForbiddenException('Access denied')

    return true
  }

  // Place les tokens dans des cookies httpOnly
  // httpOnly: true  inaccessible depuis document.cookie (protection XSS)
  // secure: true en production  uniquement sur HTTPS
  // sameSite: strict protection CSRF, cookie envoyé uniquement sur le même domaine
  private attachCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })
  }
}