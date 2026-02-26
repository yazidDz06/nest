import {Controller,Post,Body,Res,UseGuards,HttpCode,HttpStatus} from '@nestjs/common'
import { AuthenticationService } from './auth.service'
import { SignUpDto } from './dto/signup.dto'
import { SignInDto } from './dto/signin.dto'
import type { Response } from 'express'
import { AccessTokenGuard } from './guards/accessToken.guard'
import { RefreshTokenGuard } from './guards/refreshToken.guard'
import { GetCurrentUser } from './decorators/getCurrentUser.decorator'

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signup')
  signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUp(dto, res)
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK) 
  signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(dto, res)
  }

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  signOut(
    @GetCurrentUser('sub') userId: number, 
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(userId, res)
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @GetCurrentUser('sub') userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshTokens(userId, refreshToken, res)
  }
}
