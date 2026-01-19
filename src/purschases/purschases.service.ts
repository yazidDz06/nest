import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  // Récupérer toutes les ventes
  async findAll() {
    return this.prisma.purchase.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        film: {
          select: {
            id: true,
            titre: true,
            price: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Récupérer les ventes par utilisateur
  async findByUser(userId: number) {
    return this.prisma.purchase.findMany({
      where: { userId },
      include: {
        film: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Récupérer les ventes par film
  async findByFilm(filmId: number) {
    return this.prisma.purchase.findMany({
      where: { filmId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Récupérer les ventes par statut
  async findByStatus(status: PaymentStatus) {
    return this.prisma.purchase.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        film: {
          select: {
            id: true,
            titre: true,
            price: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Récupérer une vente par ID
  async findOne(id: number) {
    return this.prisma.purchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        film: true,
      },
    });
  }

  // Récupérer une vente par session Stripe
  async findByStripeSession(stripeSessionId: string) {
    return this.prisma.purchase.findUnique({
      where: { stripeSessionId },
      include: {
        user: true,
        film: true,
      },
    });
  }

  // Vérifier si un utilisateur a acheté un film
  async hasUserPurchasedFilm(userId: number, filmId: number) {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        filmId,
        status: 'PAID',
      },
    });
    return !!purchase;
  }

  // Statistiques de ventes
  async getStatistics() {
    const [total, paid, pending, failed] = await Promise.all([
      this.prisma.purchase.count(),
      this.prisma.purchase.count({ where: { status: 'PAID' } }),
      this.prisma.purchase.count({ where: { status: 'PENDING' } }),
      this.prisma.purchase.count({ where: { status: 'FAILED' } }),
    ]);

    // Calculer le revenu total
    const paidPurchases = await this.prisma.purchase.findMany({
      where: { status: 'PAID' },
      include: {
        film: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalRevenue = paidPurchases.reduce((sum, purchase) => {
      return sum + purchase.film.price;
    }, 0);

    return {
      total,
      paid,
      pending,
      failed,
      totalRevenue, // en centimes
    };
  }
}
