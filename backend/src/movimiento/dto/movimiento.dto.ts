import {IsIn,IsNotEmpty,IsNumber,IsOptional,Min} from 'class-validator';
export class MovimientoDto {

  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty({message: 'El tipo es obligatorio'})
  @IsIn(['ENTRADA', 'SALIDA'], {message: 'Tipo debe ser ENTRADA o SALIDA'})
  tipo!: string;

  @IsNotEmpty({message: 'La cantidad es obligatoria'})
  @IsNumber({}, {message: 'La cantidad debe ser numérica'})
  @Min(1, {message: 'La cantidad mínima es 1'})
  cantidad!: number;

  @IsNotEmpty({message: 'Producto obligatorio'})
  producto!: number;

  @IsNotEmpty({message: 'Usuario obligatorio'})
  usuario!: number;
}
