import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymentStatus } from '@prisma/client';

export interface DashboardStats {
  films: {
    total: number;
  };
  users: {
    total: number;
  };
  purchases: {
    total: number;
    pending: number;
    paid: number;
    failed: number;
  };
  revenue: {
    total: number; // en centimes
  };
  timestamp: Date;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    // Exécuter toutes les requêtes en parallèle
    const [
      totalFilms,
      totalUsers,
      totalPurchases,
      purchasesByStatus,
    ] = await Promise.all([
      this.prisma.film.count(),
      this.prisma.user.count(),
      this.prisma.purchase.count(),
      this.prisma.purchase.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    // Calculer le revenu total (purchases PAID uniquement)
    const paidPurchases = await this.prisma.purchase.findMany({
      where: { status: PaymentStatus.PAID },
      select: {
        film: { select: { price: true } },
      },
    });

    const totalRevenue = paidPurchases.reduce(
      (sum, p) => sum + p.film.price,
      0
    );

    // Compter les purchases par status
    const statusCounts = {
      pending: 0,
      paid: 0,
      failed: 0,
    };

    purchasesByStatus.forEach((item) => {
      if (item.status === PaymentStatus.PENDING) {
        statusCounts.pending = item._count.status;
      } else if (item.status === PaymentStatus.PAID) {
        statusCounts.paid = item._count.status;
      } else if (item.status === PaymentStatus.FAILED) {
        statusCounts.failed = item._count.status;
      }
    });

    return {
      films: {
        total: totalFilms,
      },
      users: {
        total: totalUsers,
      },
      purchases: {
        total: totalPurchases,
        pending: statusCounts.pending,
        paid: statusCounts.paid,
        failed: statusCounts.failed,
      },
      revenue: {
        total: totalRevenue,
      },
      timestamp: new Date(),
    };
  }
}