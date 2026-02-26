import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdateStatusDto } from './dto/update-status.dto'

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  statusUser: true,
  createdAt: true,
 } as const

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    // no select here cause we need it for auth
    return this.prisma.user.findUnique({ where: { email } })
  }

  create(userData: { name: string; email: string; password: string }) {
    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      },
      select: publicUserSelect,
    })
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    })
  }

  findAll() {
    return this.prisma.user.findMany({
      select: publicUserSelect,
    })
  }

  async updateRefreshToken(userId: number, hash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
      select: publicUserSelect,
    })
  }

  async removeRefreshToken(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
      select: publicUserSelect,
    })
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.password) {
      const bcrypt = await import('bcrypt')
      dto.password = await bcrypt.hash(dto.password, 10)
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: publicUserSelect,
    })
  }

  updateStatus(userId: number, dto: UpdateStatusDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { statusUser: dto.statusUser },
      select: publicUserSelect,
    })
  }

  deleteUser(userId: number) {
    return this.prisma.user.delete({
      where: { id: userId },
    })
  }
  findByIdWithRefreshToken(id: number) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      ...publicUserSelect,
      refreshTokenHash: true, 
    }
  })
}
}