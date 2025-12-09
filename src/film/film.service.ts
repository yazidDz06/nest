import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FilmService {
  constructor(private prisma: PrismaService){}

  async create(dto: CreateFilmDto, userId: number, thumbnailUrl?: string) {
    //  Vérification doublon : titre + année
    const existing = await this.prisma.film.findFirst({
      where: {
        titre: dto.titre,
        year: dto.year,
      },
    });

    if (existing) {
      throw new BadRequestException('Ce film existe déjà');
    }

    //  Création du film dans la DB
    return this.prisma.film.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        year: dto.year,
        userId,
        thumbnailUrl, 
      },
    });
  }

  findAll() {
    return `This action returns all film`;
  }

  findOne(id: number) {
    return `This action returns a #${id} film`;
  }

  update(id: number, updateFilmDto: UpdateFilmDto) {
    return `This action updates a #${id} film`;
  }

  remove(id: number) {
    return `This action removes a #${id} film`;
  }
}
