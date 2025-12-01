import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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

  
  @Get('/all')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

