import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Categoria } from './model/categoria.model';
import { CategoriaDto } from './dto/categoria.dto';

@Injectable()
export class CategoriaService {

  constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>
  ) {}

  async getAll() {
    return await this.repository.find();
  }

  async getById(id: number) {
    return await this.repository.findOne({ where: { id } });
  }

  async create(data: CategoriaDto) {
    try {
      const categoria = this.repository.create({
        nombre: data.nombre
      });

      return await this.repository.save(categoria); // 👈 devuelve la categoría
    } catch (error) {
      throw new BadRequestException('La categoría ya existe');
    }
  }

  async update(id: number, data: CategoriaDto) {
    try {
      await this.repository.update(id, {
        nombre: data.nombre
      });

      return await this.getById(id);
    } catch (error) {
      throw new BadRequestException('Error al actualizar');
    }
  }

  async delete(id: number) {
    await this.repository.delete(id);
    return { message: 'Eliminado correctamente' };
  }
}