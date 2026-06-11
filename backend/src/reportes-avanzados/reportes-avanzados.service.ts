import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Venta } from '../venta/model/venta.model';
import { VentaDetalle } from '../venta/model/venta-detalle.model';
import { Producto } from '../producto/model/producto.model';
import { Movimiento } from '../movimiento/model/movimiento.model';

@Injectable()
export class ReportesAvanzadosService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private readonly detalleRepo: Repository<VentaDetalle>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async getReporteVentas(fechaInicio?: string, fechaFin?: string, agrupacion?: 'dia' | 'mes' | 'año') {
    let query = this.ventaRepo
      .createQueryBuilder('v')
      .where('v.estado = :estado', { estado: 'pagado' });

    if (fechaInicio) {
      query = query.andWhere('v.fecha >= :fechaInicio', { fechaInicio });
    }
    if (fechaFin) {
      query = query.andWhere('v.fecha <= :fechaFin', { fechaFin });
    }

    const ventas = await query.getMany();
    
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    
    let datosAgrupados: any[] = [];
    if (agrupacion === 'mes') {
      const porMes = new Map<string, number>();
      ventas.forEach(v => {
        const fechaObj = new Date(v.fecha);
        const mes = fechaObj.toISOString().slice(0, 7);
        porMes.set(mes, (porMes.get(mes) || 0) + Number(v.total));
      });
      datosAgrupados = Array.from(porMes.entries()).map(([periodo, total]) => ({ periodo, total }));
    } else if (agrupacion === 'año') {
      const porAño = new Map<number, number>();
      ventas.forEach(v => {
        const fechaObj = new Date(v.fecha);
        const año = fechaObj.getFullYear();
        porAño.set(año, (porAño.get(año) || 0) + Number(v.total));
      });
      datosAgrupados = Array.from(porAño.entries()).map(([periodo, total]) => ({ periodo, total }));
    } else {
      const porDia = new Map<string, number>();
      ventas.forEach(v => {
        const dia = v.fecha.toISOString().slice(0, 10);
        porDia.set(dia, (porDia.get(dia) || 0) + Number(v.total));
      });
      datosAgrupados = Array.from(porDia.entries()).map(([periodo, total]) => ({ periodo, total }));
    }

    return {
      totalVentas,
      totalIngresos,
      promedioVenta: totalVentas > 0 ? totalIngresos / totalVentas : 0,
      datosAgrupados,
      ventasRecientes: ventas.slice(0, 10).map(v => ({
        id: v.id,
        numero: v.numero,
        fecha: v.fecha,
        cliente: v.clienteId,
        total: v.total,
      })),
    };
  }

  async getProductosMasVendidos(limite: number) {
    const resultados = await this.detalleRepo
      .createQueryBuilder('d')
      .innerJoin('d.venta', 'v')
      .innerJoin('d.producto', 'p')
      .where('v.estado = :estado', { estado: 'pagado' })
      .select('p.id', 'productoId')
      .addSelect('p.nombre', 'nombre')
      .addSelect('SUM(d.cantidad)', 'totalVendido')
      .addSelect('SUM(d.subtotal)', 'totalFacturado')
      .groupBy('p.id')
      .addGroupBy('p.nombre')
      .orderBy('"totalVendido"', 'DESC')
      .limit(limite)
      .getRawMany();

    return resultados.map(r => ({
      productoId: Number(r.productoId),
      nombre: r.nombre,
      totalVendido: Number(r.totalVendido),
      totalFacturado: Number(r.totalFacturado),
    }));
  }

  async getReporteGanancias(fechaInicio?: string, fechaFin?: string) {
    let queryVentas = this.ventaRepo
      .createQueryBuilder('v')
      .where('v.estado = :estado', { estado: 'pagado' });

    if (fechaInicio) {
      queryVentas = queryVentas.andWhere('v.fecha >= :fechaInicio', { fechaInicio });
    }
    if (fechaFin) {
      queryVentas = queryVentas.andWhere('v.fecha <= :fechaFin', { fechaFin });
    }

    const ventas = await queryVentas.getMany();
    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0);

    // Calcular costo de productos vendidos
    let costoTotal = 0;
    for (const venta of ventas) {
      const detalles = await this.detalleRepo.find({
        where: { ventaId: venta.id },
        relations: { producto: true },
      });
      for (const detalle of detalles) {
        const costo = Number(detalle.producto?.costo) || 0;
        costoTotal += costo * detalle.cantidad;
      }
    }

    const ganancia = totalVentas - costoTotal;
    const margen = totalVentas > 0 ? (ganancia / totalVentas) * 100 : 0;

    return {
      totalVentas,
      costoTotal,
      ganancia,
      margen: Math.round(margen * 100) / 100,
    };
  }

  async getStockBajo(limite: number) {
    const productos = await this.productoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'c')
      .where('p.stock <= p.stockMinimo')
      .orderBy('p.stock', 'ASC')
      .limit(limite)
      .getMany();

    return productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      categoria: p.categoria?.nombre || '—',
      estado: p.stock === 0 ? 'AGOTADO' : 'BAJO',
    }));
  }

  async getReporteMovimientos(fechaInicio?: string, fechaFin?: string, tipo?: 'entrada' | 'salida') {
    let query = this.movimientoRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.producto', 'p');

    if (fechaInicio) {
      query = query.andWhere('m.fecha >= :fechaInicio', { fechaInicio });
    }
    if (fechaFin) {
      query = query.andWhere('m.fecha <= :fechaFin', { fechaFin });
    }
    if (tipo) {
      query = query.andWhere('m.tipo = :tipo', { tipo });
    }

    const movimientos = await query.orderBy('m.fecha', 'DESC').limit(100).getMany();

    const totalEntradas = movimientos
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.cantidad, 0);
    
    const totalSalidas = movimientos
      .filter(m => m.tipo === 'salida')
      .reduce((sum, m) => sum + m.cantidad, 0);

    return {
      totalEntradas,
      totalSalidas,
      diferencia: totalEntradas - totalSalidas,
      movimientos: movimientos.map(m => ({
        id: m.id,
        fecha: m.fecha,
        producto: m.producto?.nombre || '—',
        tipo: m.tipo,
        cantidad: m.cantidad,
        motivo: 'Movimiento',
      })),
    };
  }
}