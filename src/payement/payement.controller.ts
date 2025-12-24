import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payement.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { WebhooksService } from 'src/webhooks/webhooks.service';
import { Req } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService,
      private webhooksService: WebhooksService,
  ) {}



  //j'utilise aussi mon custom decorateur pour recuperer utilisateur connecté
  @Post('checkout')
  create(@GetUser() user, @Body() dto: CreateCheckoutDto) {
    return this.payments.createCheckout(user.id, dto.filmId);
  }


  @Post("checkout-test")
async checkoutTest(@Body() body: { filmId: number, userId: number }) {
  return this.payments.createCheckout(body.userId, body.filmId);
}
@Post("webhook")
async stripeWebhook(@Req() req) {
  const payload = req.rawBody;
  const signature = req.headers["stripe-signature"];
  return this.webhooksService.handleStripeEvent(payload, signature);
}

}
