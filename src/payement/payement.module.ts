
import { Module } from '@nestjs/common';
import { PaymentsService } from './payement.service';
import { PaymentsController } from './payement.controller';
import { PrismaService } from 'src/prisma.service';
import { StripeModule } from '../stripe/stripe.module';
import { WebhooksService } from 'src/webhooks/webhooks.service';

@Module({
  imports: [StripeModule],
  providers: [PaymentsService, PrismaService, WebhooksService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}

