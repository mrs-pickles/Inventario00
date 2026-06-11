import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Proveedor } from './model/proveedor.model';
import { ProveedorDto } from './dto/proveedor.dto';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
  ) {}

  async getAll() {
    return await this.proveedorRepo.find({
      order: { nombre: 'ASC' },
    });
  }

  async getOne(id: number) {
    const proveedor = await this.proveedorRepo.findOne({ where: { id } });
    if (!proveedor) {
      throw new Error('Proveedor no existe');
    }
    return proveedor;
  }

  async create(data: ProveedorDto) {
    const proveedor = this.proveedorRepo.create({
      nombre: data.nombre.trim(),
      documento: data.documento?.trim() || null,
      telefono: data.telefono?.trim() || null,
      direccion: data.direccion?.trim() || null,
      email: data.email?.trim() || null,
      contacto: data.contacto?.trim() || null,
      activo: data.activo !== false,
      createdAt: new Date(),
    });
    return await this.proveedorRepo.save(proveedor);
  }

  async update(id: number, data: ProveedorDto) {
    const proveedor = await this.getOne(id);

    proveedor.nombre = data.nombre.trim();
    if (data.documento !== undefined) {
      proveedor.documento = data.documento?.trim() || null;
    }
    if (data.telefono !== undefined) {
      proveedor.telefono = data.telefono?.trim() || null;
    }
    if (data.direccion !== undefined) {
      proveedor.direccion = data.direccion?.trim() || null;
    }
    if (data.email !== undefined) {
      proveedor.email = data.email?.trim() || null;
    }
    if (data.contacto !== undefined) {
      proveedor.contacto = data.contacto?.trim() || null;
    }
    if (data.activo !== undefined) {
      proveedor.activo = data.activo;
    }
    proveedor.updatedAt = new Date();

    return await this.proveedorRepo.save(proveedor);
  }

  async delete(id: number) {
    const proveedor = await this.getOne(id);
    return await this.proveedorRepo.delete(proveedor.id);
  }
}