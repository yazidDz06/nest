import { IsEnum } from 'class-validator'
import { statusUser } from '@prisma/client'

export class UpdateStatusDto {
  @IsEnum(statusUser)
  statusUser: statusUser
}