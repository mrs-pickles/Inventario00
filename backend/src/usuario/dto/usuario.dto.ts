import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Alta de usuario: contraseña obligatoria. */
export class UsuarioCreateDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres' })
  name!: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(150)
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no debe exceder los 50 caracteres' })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  rol?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

/** Edición: todos opcionales; password solo si se desea cambiar. */
export class UsuarioUpdateDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no debe exceder los 50 caracteres' })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  rol?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
