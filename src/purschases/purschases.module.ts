import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { PurchasesService } from './purschases.service';
import { PurchasesController } from './purschases.controller';


@Module({
  imports: [PrismaModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}