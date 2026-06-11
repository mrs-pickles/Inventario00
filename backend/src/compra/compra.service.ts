import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Compra } from './model/compra.model';
import { CompraDetalle } from './model/compra-detalle.model';
import { CompraDto } from './dto/compra.dto';
import { Proveedor } from '../proveedor/model/proveedor.model';
import { Producto } from '../producto/model/producto.model';
import { Movimiento } from '../movimiento/model/movimiento.model';

@Injectable()
export class CompraService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepo: Repository<Compra>,
    @InjectRepository(CompraDetalle)
    private readonly detalleRepo: Repository<CompraDetalle>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async getAll() {
    return await this.compraRepo.find({
      relations: { proveedor: true, detalles: { producto: true } },
      order: { fecha: 'DESC' },
    });
  }

  async getHistorial(page: number, limit: number) {
    const [data, total] = await this.compraRepo.findAndCount({
      relations: { proveedor: true },
      order: { fecha: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getOne(id: number) {
    const compra = await this.compraRepo.findOne({
      where: { id },
      relations: { proveedor: true, detalles: { producto: true } },
    });
    if (!compra) throw new Error('Compra no existe');
    return compra;
  }

  async create(data: CompraDto) {
    const proveedor = await this.proveedorRepo.findOne({ where: { id: data.proveedorId } });
    if (!proveedor) throw new Error('Proveedor no existe');

    let subtotal = 0;
    const detallesData: any[] = [];

    for (const item of data.detalles) {
      let producto = await this.productoRepo.findOne({ where: { id: item.productoId } });
      if (!producto) throw new Error(`Producto ${item.productoId} no existe`);

      const subtotalItem = item.cantidad * item.precioUnitario;
      subtotal += subtotalItem;

      detallesData.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: subtotalItem,
      });

      // Actualizar stock (aumenta)
      producto.stock += item.cantidad;
      await this.productoRepo.save(producto);

      // Registrar movimiento
      const movimiento = this.movimientoRepo.create({
        producto: { id: item.productoId },
        tipo: 'entrada',
        cantidad: item.cantidad,
        fecha: new Date(),
        motivo: 'Compra',
      } as any);
      await this.movimientoRepo.save(movimiento);
    }

    const descuento = data.descuento || 0;
    const total = subtotal - descuento;

    // Generar número secuencial para compras
    const lastCompra = await this.compraRepo
      .createQueryBuilder('c')
      .orderBy('c.id', 'DESC')
      .getOne();

    let nuevoNumero = 1;
    if (lastCompra && lastCompra.numero) {
      const partes = lastCompra.numero.split('-');
      if (partes.length === 2) {
        const ultimoNumero = parseInt(partes[1], 10);
        if (!isNaN(ultimoNumero)) {
          nuevoNumero = ultimoNumero + 1;
        }
      }
    }

    const numero = `COM-${nuevoNumero.toString().padStart(4, '0')}`;

    const compra = this.compraRepo.create({
      numero,
      fecha: new Date(),
      proveedorId: data.proveedorId,
      usuarioId: 1,
      subtotal,
      descuento,
      total,
      estado: 'completada',
      observacion: data.observacion || null,
      detalles: detallesData,
    } as any);

    return await this.compraRepo.save(compra);
  }

  async anular(id: number) {
    const compra = await this.getOne(id);
    if (compra.estado === 'anulada') throw new Error('Compra ya está anulada');

    // Revertir stock (restar)
    for (const detalle of compra.detalles) {
      const producto = await this.productoRepo.findOne({ where: { id: detalle.productoId } });
      if (producto) {
        producto.stock -= detalle.cantidad;
        await this.productoRepo.save(producto);
      }
    }

    compra.estado = 'anulada';
    return await this.compraRepo.save(compra);
  }

  async delete(id: number) {
    const compra = await this.getOne(id);
    return await this.compraRepo.delete(compra.id);
  }
}