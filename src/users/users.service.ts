import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache
  ) {}

  async create(userData: { name: string; email: string; password: string }) {
    await this.cacheManager.del('users_list');
    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password
      },
    });
  }

 async findAll() {
  const cacheKey = 'users_list'; 
  const cachedData = await this.cacheManager.get(cacheKey);

  //  Si on a des données en cache, on les renvoie direct
  if (cachedData) {
    console.log('Données récupérées depuis le CACHE');
    return cachedData;
  }

  //  Si pas de cache, on va en DB
  console.log('Données récupérées depuis la DB');
  const users = await this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });


  await this.cacheManager.set(cacheKey, users);

  return users;
}

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateRefreshToken(userId: number, hashedToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hashedToken },
    });
  }

  async removeRefreshToken(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}


//ici injection manuelle de cache pour gerer la suppression de cache a la supression et aussi 
//recuperer premiere fois depuis la db et autre fois depuis le cache 
//j'ai utilisé interceptor cache dans film controller , c'est la methode rapide mais moins robuste