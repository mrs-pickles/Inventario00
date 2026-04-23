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

    const costoDef =
      data.costo != null && !Number.isNaN(Number(data.costo))
        ? Number(data.costo)
        : Math.round(Number(data.precio) * 0.88 * 100) / 100;

    const sm =
      data.stockMinimo != null && !Number.isNaN(Number(data.stockMinimo))
        ? Math.max(0, Math.floor(Number(data.stockMinimo)))
        : 0;

    const producto = this.productoRepo.create({
      nombre: data.nombre.trim(),
      codigo: data.codigo?.trim() || null,
      sku: data.sku?.trim() || null,
      origen: data.origen?.trim() || null,
      descripcion: data.descripcion?.trim() || null,
      stockMinimo: sm,
      proveedor: data.proveedor?.trim() || null,
      imagen: data.imagen?.trim() || null,
      costo: costoDef,
      precio: data.precio,
      stock: data.stock,
      activo: data.activo !== false,
      categoria: categoria,
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

    const costoVal =
      data.costo != null && !Number.isNaN(Number(data.costo))
        ? Number(data.costo)
        : producto.costo;
    producto.nombre = data.nombre.trim();
    if (data.codigo !== undefined) {
      producto.codigo = data.codigo?.trim() || null;
    }
    if (data.sku !== undefined) {
      producto.sku = data.sku?.trim() || null;
    }
    if (data.origen !== undefined) {
      producto.origen = data.origen?.trim() || null;
    }
    if (data.descripcion !== undefined) {
      producto.descripcion = data.descripcion?.trim() || null;
    }
    if (data.stockMinimo != undefined) {
      producto.stockMinimo = Math.max(
        0,
        Math.floor(Number(data.stockMinimo) || 0),
      );
    }
    if (data.proveedor !== undefined) {
      producto.proveedor = data.proveedor?.trim() || null;
    }
    if (data.imagen !== undefined) {
      producto.imagen = data.imagen?.trim() || null;
    }
    producto.costo = costoVal;
    producto.precio = data.precio;
    producto.stock = data.stock;
    if (data.activo !== undefined) {
      producto.activo = Boolean(data.activo);
    }
    producto.categoria = categoria;

    return await this.productoRepo.save(producto);
  }

  // ✅ ELIMINAR
  async delete(id: number) {
    return await this.productoRepo.delete(id);
  }

  /** Cuántos productos hay en cada categoría (dashboard). */
  async getConteoPorCategoria() {
    const rows = await this.productoRepo
      .createQueryBuilder('p')
      .innerJoin('p.categoria', 'c')
      .select('c.nombre', 'categoria')
      .addSelect('COUNT(p.id)', 'total')
      .groupBy('c.id')
      .addGroupBy('c.nombre')
      .orderBy('c.nombre', 'ASC')
      .getRawMany();
    return rows.map((r) => ({
      categoria: r.categoria,
      total: Number(r.total) || 0,
    }));
  }

  /** Totales de inventario para el panel (KPIs). */
  async getResumenInventario() {
    const total = await this.productoRepo.count();
    const agotados = await this.productoRepo
      .createQueryBuilder('p')
      .where('p.stock <= 0')
      .getCount();
    const row = await this.productoRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.precio * p.stock), 0)', 'v')
      .getRawOne<{ v: string }>();
    const valorInventario = Number(row?.v) || 0;
    return {
      totalProductos: total,
      productosAgotados: agotados,
      devoluciones: 0,
      pedidosEnCamino: 0,
      valorInventarioBs: valorInventario,
    };
  }

  /** Filas y total para el informe de existencias (valor = precio × stock). */
  async getInformeExistencias() {
    try {
      const list = await this.productoRepo.find({
        relations: { categoria: true },
        order: { nombre: 'ASC' },
      });
      let totalValor = 0;
      const filas = list.map((p) => {
        const prec = Number(p.precio) || 0;
        const st = Math.floor(Number(p.stock)) || 0;
        const valor = Math.round(prec * st * 100) / 100;
        totalValor += valor;
        const sku =
          p.sku?.toString().trim() || 'PRD-' + String(p.id).padStart(6, '0');
        return {
          id: p.id,
          nombre: p.nombre,
          sku,
          categoria: p.categoria?.nombre ?? '—',
          cantidad: st,
          valor: valor,
        };
      });
      return {
        existenciasTotalBs: Math.round(totalValor * 100) / 100,
        filas,
      };
    } catch {
      return { existenciasTotalBs: 0, filas: [] };
    }
  }
}