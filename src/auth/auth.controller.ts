import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RtGuard } from './guards/rt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  signup(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }


 @Post('login')
async signin(@Body() dto: LoginDto) {
  const user = await this.authService.validateUser(dto.email, dto.password);

  if (!user) {
    throw new UnauthorizedException('Email or password incorrect');
  }

  return {
    message: 'Logged in successfully',
    user,
  };
}

  // =========================
  // REFRESH
  // =========================
  @UseGuards(RtGuard)
  @Post('refresh')
  async refresh(@GetUser() user: { sub: number; email: string; role: string; refreshToken: string }) {
    // Générer de nouveaux tokens
    const tokens = await this.authService.getTokens({
      id: user.sub,
      email: user.email,
      role: user.role,
    });

    // Stocker le nouveau refresh token hashé
    await this.authService.storeRefreshToken(user.sub, tokens.refreshToken);

    // Retourner les tokens directement (ou gérer les cookies dans un interceptor)
    return {
      message: 'Tokens refreshed',
      tokens,
    };
  }

  // =========================
  // LOGOUT
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@GetUser('sub') userId: number) {
    await this.authService.removeRefreshToken(userId);
    return { message: 'Logged out' };
  }
}


