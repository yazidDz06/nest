import { Controller, Get, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common'
import { UsersService } from './users.service'
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator'
import { Role } from '@prisma/client'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdateStatusDto } from './dto/update-status.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  getMe(@GetCurrentUser('sub') userId: number) {
    return this.usersService.findById(userId)
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  updateMe(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto)
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto)
  }

  @UseGuards(AccessTokenGuard)
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  deleteMe(@GetCurrentUser('sub') userId: number) {
    return this.usersService.deleteUser(userId)
  }
  
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id)
  }
}