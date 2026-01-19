import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { PurschasesService } from './purschases.service';


@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [PurschasesService],
})
export class PurchasesModule {}