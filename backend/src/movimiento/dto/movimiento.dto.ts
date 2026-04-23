import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MovimientoDto {

  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty({message: 'El tipo es obligatorio'})
  @IsIn(['ENTRADA', 'SALIDA', 'COMPRA'], {
    message: 'Tipo debe ser ENTRADA, SALIDA o COMPRA',
  })
  tipo!: string;

  @IsNotEmpty({message: 'La cantidad es obligatoria'})
  @IsNumber({}, {message: 'La cantidad debe ser numérica'})
  @Min(1, {message: 'La cantidad mínima es 1'})
  cantidad!: number;

  /** Precio unitario de compra al proveedor (recomendado en COMPRA). */
  @IsOptional()
  @IsNumber({}, {message: 'El precio de compra debe ser numérico'})
  @Min(0, {message: 'El precio de compra no puede ser negativo'})
  @Type(() => Number)
  precioCompra?: number;

  @IsNotEmpty({message: 'Producto obligatorio'})
  producto!: number;

  @IsNotEmpty({message: 'Usuario obligatorio'})
  usuario!: number;
}
