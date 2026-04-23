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

        // ACTUALIZAR STOCK (COMPRA = entrada de mercadería al proveedor)
  if (data.tipo === 'ENTRADA' || data.tipo === 'COMPRA') {
    producto.stock += data.cantidad;
  }

  if (data.tipo === 'SALIDA') {

    if (producto.stock < data.cantidad) {
      throw new Error('Stock insuficiente');
    }

    producto.stock -= data.cantidad;
  }

  await this.productoRepository.save(producto);

    const precioCompra =
      data.precioCompra != null && !Number.isNaN(Number(data.precioCompra))
        ? Math.round(Number(data.precioCompra) * 10000) / 10000
        : null;

    const entity = this.repository.create({
      tipo: data.tipo,
      cantidad: data.cantidad,
      precioCompra,
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

  private async sumaCantidadPorMes(
    year: number,
    tipo: 'ENTRADA' | 'SALIDA',
  ): Promise<number[]> {
    const raw = await this.repository
      .createQueryBuilder('m')
      .select('EXTRACT(MONTH FROM m.fecha)', 'mes')
      .addSelect('COALESCE(SUM(m.cantidad), 0)', 'total')
      .where('m.tipo = :t', { t: tipo })
      .andWhere('EXTRACT(YEAR FROM m.fecha) = :y', { y: year })
      .groupBy('EXTRACT(MONTH FROM m.fecha)')
      .orderBy('EXTRACT(MONTH FROM m.fecha)', 'ASC')
      .getRawMany();

    const porMes = Array.from({ length: 12 }, () => 0);
    for (const row of raw) {
      const idx = Math.floor(Number(row.mes)) - 1;
      if (idx >= 0 && idx < 12) {
        porMes[idx] = Number(row.total) || 0;
      }
    }
    return porMes;
  }

  /** Unidades vendidas (SALIDA) por mes en un año, 1–12. */
  async getVentasPorMes(year: number) {
    const porMes = await this.sumaCantidadPorMes(year, 'SALIDA');
    return {
      year,
      porMes: porMes.map((cantidad, i) => ({ mes: i + 1, cantidad })),
    };
  }

  /** Unidades de ENTRADA y SALIDA por mes (gráfico comparativo). */
  async getEntradasSalidasPorMes(year: number) {
    const entradas = await this.sumaCantidadPorMes(year, 'ENTRADA');
    const salidas = await this.sumaCantidadPorMes(year, 'SALIDA');
    return { year, entradas, salidas };
  }

  /**
   * Monto aproximado de ventas (SALIDA) por mes: suma de cantidad × precio actual del producto.
   */
  async getGananciasPorMes(year: number) {
    const raw = await this.repository
      .createQueryBuilder('m')
      .innerJoin('m.producto', 'p')
      .select('EXTRACT(MONTH FROM m.fecha)', 'mes')
      .addSelect('COALESCE(SUM(m.cantidad * p.precio), 0)', 'total')
      .where('m.tipo = :t', { t: 'SALIDA' })
      .andWhere('EXTRACT(YEAR FROM m.fecha) = :y', { y: year })
      .groupBy('EXTRACT(MONTH FROM m.fecha)')
      .orderBy('EXTRACT(MONTH FROM m.fecha)', 'ASC')
      .getRawMany();

    const porMes = Array.from({ length: 12 }, () => 0);
    for (const row of raw) {
      const idx = Math.floor(Number(row.mes)) - 1;
      if (idx >= 0 && idx < 12) {
        porMes[idx] = Number(row.total) || 0;
      }
    }
    return { year, porMes: porMes.map((monto, i) => ({ mes: i + 1, monto })) };
  }

  /** Productos con más unidades vendidas (SALIDA) en el año. */
  async getTopProductosVendidos(year: number, limit: number) {
    const raw = await this.repository
      .createQueryBuilder('m')
      .innerJoin('m.producto', 'p')
      .select('p.nombre', 'nombre')
      .addSelect('COALESCE(SUM(m.cantidad), 0)', 'total')
      .where('m.tipo = :t', { t: 'SALIDA' })
      .andWhere('EXTRACT(YEAR FROM m.fecha) = :y', { y: year })
      .groupBy('p.id')
      .addGroupBy('p.nombre')
      .orderBy('SUM(m.cantidad)', 'DESC')
      .limit(Math.min(Math.max(1, limit), 20))
      .getRawMany();

    return raw.map((r) => ({
      nombre: r.nombre,
      cantidad: Number(r.total) || 0,
    }));
  }
}