import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Producto } from './model/producto.model';
import { Categoria } from '../categoria/model/categoria.model';
import { ProductoDto } from './dto/producto.dto';

@Injectable()
export class ProductoService {

  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,

    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  // ✅ LISTAR
  async getAll() {
    return await this.productoRepo.find({
      relations: { categoria: true }
    });
  }

  // ✅ CREAR (AQUÍ VA, DENTRO DE LA CLASE)
  async create(data: ProductoDto) {

    const categoria = await this.categoriaRepo.findOne({
      where: { id: data.categoriaId }
    });

    if (!categoria) {
      throw new Error('Categoría no existe');
    }

    const producto = this.productoRepo.create({
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock,
      categoria: categoria
    });

    return await this.productoRepo.save(producto);
  }

  // ✅ ACTUALIZAR
  async update(id: number, data: ProductoDto) {

    const producto = await this.productoRepo.findOne({
      where: { id }
    });

    if (!producto) {
      throw new Error('Producto no existe');
    }

    const categoria = await this.categoriaRepo.findOne({
      where: { id: data.categoriaId }
    });

    if (!categoria) {
      throw new Error('Categoría no existe');
    }

    producto.nombre = data.nombre;
    producto.precio = data.precio;
    producto.stock = data.stock;
    producto.categoria = categoria;

    return await this.productoRepo.save(producto);
  }

  // ✅ ELIMINAR
  async delete(id: number) {
    return await this.productoRepo.delete(id);
  }
}