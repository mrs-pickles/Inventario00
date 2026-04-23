import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductoDto {
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  origen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stockMinimo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  proveedor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3_000_000)
  imagen?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  costo?: number;

  @IsNumber()
  @Type(() => Number)
  precio!: number;

  @IsNumber()
  @Type(() => Number)
  stock!: number;

  @IsNumber()
  @Type(() => Number)
  categoriaId!: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activo?: boolean;
}
