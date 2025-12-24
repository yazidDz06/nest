import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateFilmDto {
  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1800)
  year: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsNotEmpty()
  @IsInt()
  price: number; // centimes

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @IsOptional()
  isPublished?: boolean;

}
