import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VentaDetalleDto } from './venta-detalle.dto';

export class VentaDto {
  @IsNotEmpty()
  @IsNumber()
  clienteId!: number;

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
  @Type(() => VentaDetalleDto)
  detalles!: VentaDetalleDto[];
}