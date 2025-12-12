import {Controller,Post,Body,UseGuards,Res,HttpCode,HttpStatus,UnauthorizedException,Get} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RtGuard } from './guards/rt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  private cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };

 
  // REGISTER
 
  @Post('register')
  async signup(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  // LOGIN

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signin(@Body() dto: LoginDto,@Res({ passthrough: true }) res: Response) {
    // Validation credentials
    const validationResult = await this.authService.validateUser(
      dto.email,
      dto.password,
    );

    if (!validationResult) {
      throw new UnauthorizedException('Email or password incorrect');
    }

    // Récupérer l'utilisateur complet depuis la DB (avec l'id)
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('No user found');
    }

    // Générer les tokens
    const tokens = await this.authService.getTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Stocker le refresh token hashé en DB
    await this.authService.storeRefreshToken(user.id, tokens.refreshToken);

    // Définir les cookies httpOnly
    res.cookie('access_token', tokens.accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return {
      message: 'Connected succesfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

 
  // REFRESH

  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @GetUser()
    user: { sub: number; email: string; role: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // Vérifier que le refresh token correspond au hash en DB
    await this.authService.validateRefreshTokenAgainstDb(
      user.sub,
      user.refreshToken,
    );

    // Générer de nouveaux tokens
    const tokens = await this.authService.getTokens({
      id: user.sub,
      email: user.email,
      role: user.role,
    });

    // Stocker le nouveau refresh token hashé en DB
    await this.authService.storeRefreshToken(user.sub, tokens.refreshToken);

    // Mettre à jour les cookies
    res.cookie('access_token', tokens.accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Tokens rafraîchis avec succès',
    };
  }


  // LOGOUT
  
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @GetUser('sub') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Supprimer le refresh token de la DB
    await this.authService.removeRefreshToken(userId);

    // Effacer les cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return {
      message: 'Déconnexion réussie',
    };
  }
}

