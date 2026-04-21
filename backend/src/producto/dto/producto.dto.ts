import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductoDto {

  @IsNotEmpty()
  nombre!: string;

  @IsNumber()
  @Type(() => Number)
  precio!: number;

  @IsNumber()
  @Type(() => Number)
  stock!: number;

  @IsNumber()
  @Type(() => Number)
  categoriaId!: number;
}