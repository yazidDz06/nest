
import { Controller, Headers, Post, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { Request } from 'express';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooks: WebhooksService) {}

  @Post('stripe')
handle(@Req() req: Request & { rawBody: Buffer }, @Headers('stripe-signature') sig: string) {
  return this.webhooks.handleStripeEvent(req.rawBody, sig);
}

}
