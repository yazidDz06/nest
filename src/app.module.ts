import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true,
    }),PrismaModule, UsersModule, AuthModule],//imported prismaModule a single time after adding global decorator on prismamodule file
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
