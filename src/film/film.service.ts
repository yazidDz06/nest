import {BadRequestException, Injectable,NotFoundException,InternalServerErrorException} from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FilmService {
  constructor(private prisma: PrismaService) {}

  // CREATE FILM (auteur / admin)
  async create(
    dto: CreateFilmDto,
    authorId: number,
    thumbnailUrl?: string,
  ) {
    const titreNormalized = dto.titre.trim().toLowerCase();

    const existing = await this.prisma.film.findFirst({
      where: {
        titre: { equals: titreNormalized, mode: 'insensitive' },
        year: dto.year,
      },
    });

    if (existing) {
      throw new BadRequestException('Ce film existe déjà');
    }

    try {
      return await this.prisma.film.create({
        data: {
          titre: dto.titre.trim(),
          description: dto.description.trim(),
          year: dto.year,

          price: dto.price,
          currency: dto.currency ?? 'EUR',
          stripePriceId: dto.stripePriceId,
          isPublished: true,
          thumbnailUrl,
          authorId,
        },
      });
    } catch (error) {
        console.error(error); 
      throw new InternalServerErrorException(
        'Erreur lors de la création du film',
      );
    }
  }

  // LISTE DES FILMS (public)
  async findAll() {
    try {
      return await this.prisma.film.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          titre: true,
          description: true,
          year: true,
          price: true,
          currency: true,
          thumbnailUrl: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch {
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des films',
      );
    }
  }

  // DÉTAIL FILM (public)
  async findOne(id: number) {
    const film = await this.prisma.film.findFirst({
      where: {
        id,
        isPublished: true,
      },
    });

    if (!film) {
      throw new NotFoundException(
        `Le film avec l'ID ${id} n'existe pas`,
      );
    }

    return film;
  }

  // UPDATE FILM (sans toucher au prix Stripe)
  async update(id: number, dto: UpdateFilmDto) {
    await this.findOne(id);

    // Sécurité : empêcher modification Stripe / prix
    const { stripePriceId, price, ...safeDto } = dto as any;

    try {
      return await this.prisma.film.update({
        where: { id },
        data: safeDto,
      });
    } catch {
      throw new BadRequestException(
        'Échec de la mise à jour du film',
      );
    }
  }

  // SOFT DELETE (recommandé)
  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.film.update({
        where: { id },
        data: { isPublished: false },
      });

      return {
        message: `Film #${id} désactivé avec succès`,
      };
    } catch {
      throw new InternalServerErrorException(
        'Erreur lors de la suppression du film',
      );
    }
  }
}
