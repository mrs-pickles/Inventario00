import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cliente } from './model/cliente.model';
import { ClienteDto } from './dto/cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async getAll() {
    return await this.clienteRepo.find({
      order: { nombre: 'ASC' },
    });
  }

  async getOne(id: number) {
    const cliente = await this.clienteRepo.findOne({ where: { id } });
    if (!cliente) {
      throw new Error('Cliente no existe');
    }
    return cliente;
  }

  async create(data: ClienteDto) {
    const cliente = this.clienteRepo.create({
      nombre: data.nombre.trim(),
      documento: data.documento?.trim() || null,
      email: data.email?.trim() || null,
      telefono: data.telefono?.trim() || null,
      direccion: data.direccion?.trim() || null,
      activo: data.activo !== false,
      createdAt: new Date(),
    });
    return await this.clienteRepo.save(cliente);
  }

  async update(id: number, data: ClienteDto) {
    const cliente = await this.getOne(id);

    cliente.nombre = data.nombre.trim();
    if (data.documento !== undefined) {
      cliente.documento = data.documento?.trim() || null;
    }
    if (data.email !== undefined) {
      cliente.email = data.email?.trim() || null;
    }
    if (data.telefono !== undefined) {
      cliente.telefono = data.telefono?.trim() || null;
    }
    if (data.direccion !== undefined) {
      cliente.direccion = data.direccion?.trim() || null;
    }
    if (data.activo !== undefined) {
      cliente.activo = data.activo;
    }
    cliente.updatedAt = new Date();

    return await this.clienteRepo.save(cliente);
  }

  async delete(id: number) {
    const cliente = await this.getOne(id);
    return await this.clienteRepo.delete(cliente.id);
  }
}