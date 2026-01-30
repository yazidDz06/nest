import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsGateway } from './stats.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [ChatModule, PrismaModule],
  providers: [StatsGateway, StatsService],
  exports: [StatsService]
})
export class StatsModule {}
