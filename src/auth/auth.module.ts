import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthenticationController } from './auth.controller'
import { AuthenticationService } from './auth.service'
import { UsersModule } from 'src/users/users.module'
import { AccessTokenStrategy } from './strategies/accessToken.strategy'
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthenticationModule {}

