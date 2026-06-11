import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CompraDetalleDto } from './compra-detalle.dto';

export class CompraDto {
  @IsNotEmpty()
  @IsNumber()
  proveedorId!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  descuento?: number;

  @IsOptional()
  @IsString()
  observacion?: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CompraDetalleDto)
  detalles!: CompraDetalleDto[];
}