import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfiguracionDto {
  @IsNotEmpty()
  @IsString()
  clave!: string;

  @IsOptional()
  valor?: any;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  tipo?: string;
}