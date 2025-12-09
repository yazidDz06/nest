import { Module } from '@nestjs/common';
import { FilmService } from './film.service';
import { FilmController } from './film.controller';
import { PrismaModule } from 'src/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule,CloudinaryModule],
  controllers: [FilmController],
  providers: [FilmService],
})
export class FilmModule {}
