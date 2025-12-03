import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Route GET /users/me — profil du user authentifié
@UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@Req() req) {
  const userId = req.user.sub;
  const user = await this.usersService.findById(userId);

  // Supprimer les champs sensibles
  delete (user as any).password;
  delete (user as any).refreshTokenHash;

  return user;
}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @Get('/all')
  findAll() {
    return this.usersService.findAll();
  }


  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['USER'])
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

