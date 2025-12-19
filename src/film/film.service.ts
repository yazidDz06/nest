import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FilmService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFilmDto, userId: number, thumbnailUrl?: string) {
    const existing = await this.prisma.film.findFirst({
      where: { titre: dto.titre, year: dto.year },
    });

 
    if (existing) {
      throw new BadRequestException('Ce film existe déjà');
    }

    return this.prisma.film.create({
      data: { ...dto, userId, thumbnailUrl },
    });
  }

 
  async findAll() {
    try {
      console.log("inside service")
    const films= await this.prisma.film.findMany();
    return films
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Erreur lors de la récupération des films");
    }
  }

  async findOne(id: number) {
    const film = await this.prisma.film.findUnique({ where: { id } });
    if (!film) {
      throw new NotFoundException(`Le film avec l'ID ${id} n'existe pas`);
    }
    return film;
  }

  async update(id: number, dto: UpdateFilmDto) {
    
    await this.findOne(id); 

   
    try {
      return await this.prisma.film.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new BadRequestException("Échec de la mise à jour");
    }
  }

  async remove(id: number) {
    
    await this.findOne(id);

    try {
      await this.prisma.film.delete({ where: { id } });
      return { message: `Film #${id} supprimé avec succès` };
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la suppression");
    }
  }
}