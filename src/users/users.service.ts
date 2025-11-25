import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
   constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password
      }
    })
  }

findAll() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    }
  });
}

findOne(id: number) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      email: true,
      //excluding password
    }
  });
}

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
        where: { id },
        data:{
          name : updateUserDto.name,
          password : updateUserDto.password

        }
    })
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: {id}
    })
  }
}
