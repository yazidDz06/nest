import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';
import { IsEmail, IsString } from 'class-validator';
export class LoginDto extends PartialType(RegisterDto) {
    @IsEmail()
  email: string;

  @IsString()
  password: string;
}
