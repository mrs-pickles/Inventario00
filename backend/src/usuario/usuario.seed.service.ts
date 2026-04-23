import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from './model/usuario.model';

/** Cuentas de prueba: solo se insertan si el email no existe. */
const USUARIOS_DEMO: {
  name: string;
  email: string;
  password: string;
  rol: string;
}[] = [
  {
    name: 'Graciela Mamani',
    email: 'graciela@gmail.com',
    password: '123456',
    rol: 'Administrador',
  },
  {
    name: 'Julieta Rocha',
    email: 'julieta@gmail.com',
    password: '123456',
    rol: 'Administrador',
  },
  {
    name: 'Elmer Mamani',
    email: 'elmer@gmail.com',
    password: '123456',
    rol: 'Administrador',
  },
];

@Injectable()
export class UsuarioSeedService implements OnModuleInit {
  private readonly log = new Logger(UsuarioSeedService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    for (const u of USUARIOS_DEMO) {
      const exist = await this.repository.findOne({
        where: { email: u.email },
      });
      if (exist) {
        continue;
      }
      await this.repository.save(
        this.repository.create({
          name: u.name,
          email: u.email,
          password: u.password,
          rol: u.rol,
          activo: true,
        }),
      );
      this.log.log(`Usuario demo creado: ${u.email}`);
    }
  }
}
