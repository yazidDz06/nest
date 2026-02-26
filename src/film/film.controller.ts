import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator';


@UseInterceptors(CacheInterceptor)
@Controller('films')
export class FilmController {
  constructor(private readonly filmService: FilmService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  
  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(@Body() dto: CreateFilmDto,@UploadedFile() file: Express.Multer.File, @GetCurrentUser('sub') userId: number,
  ) {
    let thumbnailUrl: string | undefined

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file.path);
      thumbnailUrl = uploaded.secure_url;
    }
    return this.filmService.create(dto, userId, thumbnailUrl);
  }

  //@CachKey //c'est optionnel pour que key de redis ne prend pas route comme nom de clé
  @Get()
  findAll() {
    console.log("inside controller")
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
