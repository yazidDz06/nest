import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
  ) {}

  async createCheckout(userId: number, filmId: number) {
    // 1️⃣ Récupérer le film
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });

    if (!film || !film.isPublished) {
      throw new NotFoundException('Film indisponible');
    }

    // 2️⃣ Vérifier qu’un prix Stripe existe, sinon le créer
    let stripePriceId = film.stripePriceId;
    if (!stripePriceId) {
      try {
        const product = await this.stripe.client.products.create({
          name: film.titre,
          description: film.description ?? undefined,
        });

        const price = await this.stripe.client.prices.create({
          unit_amount: film.price, // déjà en centimes
          currency: film.currency.toLowerCase(),
          product: product.id,
        });

        // Stocker le price Stripe dans la base
        const updatedFilm = await this.prisma.film.update({
          where: { id: film.id },
          data: { stripePriceId: price.id },
        });

        stripePriceId = updatedFilm.stripePriceId;
      } catch (err) {
        console.error(err);
        throw new InternalServerErrorException('Erreur lors de la création du prix Stripe');
      }
    }

    if (typeof stripePriceId !== 'string') {
      throw new InternalServerErrorException('stripePriceId invalide en base');
    }

    // 3️⃣ Vérifier si l’utilisateur a déjà un achat en cours ou payé
    const existingPurchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        filmId,
        OR: [{ status: 'PENDING' }, { status: 'PAID' }],
      },
    });

    if (existingPurchase?.status === 'PAID') {
      throw new BadRequestException('Film déjà acheté');
    }

    if (existingPurchase?.status === 'PENDING') {
      return {
        sessionId: existingPurchase.stripeSessionId,
        checkoutUrl: (await this.stripe.client.checkout.sessions.retrieve(existingPurchase.stripeSessionId)).url ?? undefined,
      };
    }

    // 4️⃣ Créer la session Stripe Checkout
    const session = await this.stripe.client.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      metadata: {
        userId: String(userId),
        filmId: String(filmId),
      },
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    // 5️⃣ Enregistrer l’achat dans la base
  await this.prisma.purchase.create({
  data: {
    userId, //  pas undefined
    filmId,
    stripeSessionId: session.id,
    status: "PENDING",
  },
});

    // 6️⃣ Retourner au futur frontend
    return {
      sessionId: session.id,
      checkoutUrl: session.url ?? undefined,
    };
  }
}


