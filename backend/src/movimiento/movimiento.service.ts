import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movimiento } from './model/movimiento.model';
import { Producto } from '../producto/model/producto.model';
import { Usuario } from '../usuario/model/usuario.model';
import { MovimientoDto } from './dto/movimiento.dto';

@Injectable()
export class MovimientoService {

  constructor(
    @InjectRepository(Movimiento)
      private readonly repository: Repository<Movimiento>,

    @InjectRepository(Producto)
      private readonly productoRepository: Repository<Producto>,

    @InjectRepository(Usuario)
      private readonly usuarioRepository: Repository<Usuario>
  ) {}

  async getAll() {
    return await this.repository.find({
      relations: ['producto', 'usuario']
    });
  }

  async getById(id: number) {
    return await this.findById(id);
  }

  async create(data: MovimientoDto) {

    const producto = await this.productoRepository.findOne({
      where: { id: data.producto }
  });

  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  const usuario = await this.usuarioRepository.findOne({
    where: { id: data.usuario }
  });

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

        // ACTUALIZAR STOCK
  if (data.tipo === 'ENTRADA') {
    producto.stock += data.cantidad;
  }

  if (data.tipo === 'SALIDA') {

    if (producto.stock < data.cantidad) {
      throw new Error('Stock insuficiente');
    }

    producto.stock -= data.cantidad;
  }

  await this.productoRepository.save(producto);

    const entity = this.repository.create({
      tipo: data.tipo,
      cantidad: data.cantidad,
      producto,
      usuario
    });

    await this.repository.save(entity);

      return 'Movimiento registrado correctamente';
    }

  async delete(id: number) {

    const movimiento = await this.findById(id);

    if (!movimiento) {
      throw new Error('Movimiento no encontrado');
    }

    await this.repository.delete(id);

      return 'Movimiento eliminado correctamente';
    }

  private async findById(id: number) {
    return await this.repository.findOne({
      where: { id },
      relations: ['producto', 'usuario']
    });
  }
}