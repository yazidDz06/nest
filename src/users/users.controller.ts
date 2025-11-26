import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { UsersService } from './users.service';



@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('/all')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: string) {
    return this.usersService.findOne(+id);
  }
 

 
  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: string) {
    return this.usersService.remove(+id);
  }
}
