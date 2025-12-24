
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(
    private stripe: StripeService,
    private prisma: PrismaService,
  ) {}

  async handleStripeEvent(payload: Buffer, signature: string) {
    const event = this.stripe.client.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type !== 'checkout.session.completed') {
      return { ignored: true };
    }
    const session = event.data.object as Stripe.Checkout.Session;

const purchase = await this.prisma.purchase.findUnique({
  where: { stripeSessionId: session.id },
});

if (!purchase) {
  console.log("Webhook: achat non trouvé pour session", session.id);
  return { received: false, error: "Purchase not found" };
}

await this.prisma.purchase.update({
  where: { stripeSessionId: session.id },
  data: {
    status: 'PAID',
    stripePaymentId: session.payment_intent as string,
  },
});

return { received: true };

  }
}

