import {IsNotEmpty,IsNumber,IsOptional,IsString,MaxLength,MinLength} from 'class-validator';

export class CategoriaDto {

  @IsOptional()
  @IsNumber({}, {message: 'El id debe ser numérico'})
  id?: number;

  @IsNotEmpty({message: 'El nombre de la categoría es obligatorio'})
  @IsString({message: 'El nombre debe ser texto'})
  @MinLength(3, {message: 'Debe tener al menos 3 caracteres'})
  @MaxLength(50, {message: 'No debe exceder 50 caracteres'})
  nombre!: string;
}