import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { FilmModule } from './film/film.module';
import { StripeModule } from './stripe/stripe.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PaymentsModule } from './payement/payement.module';
import { WebhooksModule } from './webhooks/webhooks.module';

import { PurchasesModule } from './purschases/purschases.module';
import { ChatModule } from './chat/chat.module';
import { StatsModule } from './stats/stats.module';


@Module({
  imports: [
    
    ConfigModule.forRoot({ isGlobal: true }),
    
    //  Cache avec Redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
          //ttl optionnel
        }),
      }),
    }),

    PrismaModule,
    UsersModule,
    AuthModule,
    CloudinaryModule,
    UploadModule,
    FilmModule,
    StripeModule,
    WebhooksModule,
    PaymentsModule,
    ChatModule,
    PurchasesModule,
    StatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}