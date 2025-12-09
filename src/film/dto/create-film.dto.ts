import { IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateFilmDto {
  @IsNotEmpty()
  titre: string;

  @IsNotEmpty()
  description: string;

  @Min(1900)
  @Max(2100)
  year: number;

  @IsOptional()
  thumbnailUrl?: string; 
}

