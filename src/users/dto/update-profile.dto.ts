import { IsOptional, IsString, MinLength, IsEmail } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @MinLength(8)
  password?: string
}