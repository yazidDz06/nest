import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('film')
export class FilmController {
  constructor(private readonly filmService: FilmService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(@Body() dto: CreateFilmDto,@UploadedFile() file: Express.Multer.File, @GetUser('sub') userId: number,
  ) {
    let thumbnailUrl: string | undefined

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file.path);
      thumbnailUrl = uploaded.secure_url;
    }
    return this.filmService.create(dto, userId, thumbnailUrl);
  }

  @Get()
  findAll() {
    return this.filmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto) {
    return this.filmService.update(+id, updateFilmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filmService.remove(+id);
  }
}
