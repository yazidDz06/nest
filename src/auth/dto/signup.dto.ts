import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator'


export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string

}
