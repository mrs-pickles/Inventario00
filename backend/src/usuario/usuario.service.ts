import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from './model/usuario.model';
import { UsuarioCreateDto, UsuarioUpdateDto } from './dto/usuario.dto';

export type UsuarioPublico = {
  id: number;
  name: string;
  email: string;
  rol: string;
  activo: boolean;
};

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  private aPublico(u: Usuario): UsuarioPublico {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      rol: u.rol ?? 'Administrador',
      activo: u.activo !== false,
    };
  }

  async getAll(): Promise<UsuarioPublico[]> {
    const rows = await this.repository.find({
      order: { id: 'ASC' },
    });
    return rows.map((u) => this.aPublico(u));
  }

  async getById(id: number) {
    const u = await this.findById(id);
    if (!u) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return this.aPublico(u);
  }

  async create(data: UsuarioCreateDto) {
    const entity = this.repository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      rol: data.rol?.trim() || 'Administrador',
      activo: data.activo ?? true,
    });
    await this.repository.save(entity);
    return 'Usuario guardado correctamente';
  }

  async update(id: number, data: UsuarioUpdateDto) {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    const patch: Record<string, unknown> = { ...data };
    if (
      patch['password'] === undefined ||
      patch['password'] === null ||
      patch['password'] === ''
    ) {
      delete patch['password'];
    }
    if (Object.keys(patch).length) {
      await this.repository.update({ id }, patch as Partial<Usuario>);
    }
    return 'Usuario actualizado correctamente';
  }

  async delete(id: number) {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    await this.repository.delete(id);
    return 'Usuario eliminado correctamente';
  }

  private async findById(id: number) {
    return await this.repository.findOne({
      where: { id },
      relations: ['movimientos'],
    });
  }
}
