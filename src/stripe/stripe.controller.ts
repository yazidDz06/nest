// stripe.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('payments')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-intent')
  async createIntent(@Body('amount') amount: number) {
    const paymentIntent =
      await this.stripeService.createPaymentIntent(amount);

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }
}

