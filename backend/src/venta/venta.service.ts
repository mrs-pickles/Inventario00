import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Venta } from './model/venta.model';
import { VentaDetalle } from './model/venta-detalle.model';
import { VentaDto } from './dto/venta.dto';
import { Cliente } from '../cliente/model/cliente.model';
import { Usuario } from '../usuario/model/usuario.model';
import { Producto } from '../producto/model/producto.model';
import { Movimiento } from '../movimiento/model/movimiento.model';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private readonly detalleRepo: Repository<VentaDetalle>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async getAll() {
    return await this.ventaRepo.find({
      relations: { cliente: true, usuario: true, detalles: { producto: true } },
      order: { fecha: 'DESC' },
    });
  }

  async getHistorial(page: number, limit: number) {
    const [data, total] = await this.ventaRepo.findAndCount({
      relations: { cliente: true, usuario: true },
      order: { fecha: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getOne(id: number) {
    const venta = await this.ventaRepo.findOne({
      where: { id },
      relations: { cliente: true, usuario: true, detalles: { producto: true } },
    });
    if (!venta) throw new Error('Venta no existe');
    return venta;
  }

  async create(data: VentaDto) {
    const cliente = await this.clienteRepo.findOne({ where: { id: data.clienteId } });
    if (!cliente) throw new Error('Cliente no existe');

    let subtotal = 0;
    const detallesData: VentaDetalle[] = [];

    for (const item of data.detalles) {
      const producto = await this.productoRepo.findOne({ where: { id: item.productoId } });
      if (!producto) throw new Error(`Producto ${item.productoId} no existe`);
      if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente de ${producto.nombre}`);

      const subtotalItem = item.cantidad * item.precioUnitario;
      subtotal += subtotalItem;

            detallesData.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: subtotalItem,
      } as VentaDetalle);

      // Actualizar stock
      producto.stock -= item.cantidad;
      await this.productoRepo.save(producto);

      // Registrar movimiento
      const movimiento = this.movimientoRepo.create({
        producto: { id: item.productoId },
        tipo: 'salida',
        cantidad: item.cantidad,
        fecha: new Date(),
        motivo: 'Venta',
      } as any);
      await this.movimientoRepo.save(movimiento);
    }

    const descuento = data.descuento || 0;
    const total = subtotal - descuento;

    // Generar número secuencial corregido
    const lastVenta = await this.ventaRepo
      .createQueryBuilder('v')
      .orderBy('v.id', 'DESC')
      .getOne();

    let nuevoNumero = 1;
    if (lastVenta && lastVenta.numero) {
      const partes = lastVenta.numero.split('-');
      if (partes.length === 2) {
        const ultimoNumero = parseInt(partes[1], 10);
        if (!isNaN(ultimoNumero)) {
          nuevoNumero = ultimoNumero + 1;
        }
      }
    }

    const numero = `VEN-${nuevoNumero.toString().padStart(4, '0')}`;

    const venta = this.ventaRepo.create({
      numero,
      fecha: new Date(),
      clienteId: data.clienteId,
      usuarioId: 1,
      subtotal,
      descuento,
      total,
      estado: 'pagado',
      observacion: data.observacion || null,
      detalles: detallesData,
    } as any);

    return await this.ventaRepo.save(venta);
  }

  async anular(id: number) {
    const venta = await this.getOne(id);
    if (venta.estado === 'anulado') throw new Error('Venta ya está anulada');

    // Revertir stock
    for (const detalle of venta.detalles) {
      const producto = await this.productoRepo.findOne({ where: { id: detalle.productoId } });
      if (producto) {
        producto.stock += detalle.cantidad;
        await this.productoRepo.save(producto);
      }
    }

    venta.estado = 'anulado';
    return await this.ventaRepo.save(venta);
  }

  async delete(id: number) {
    const venta = await this.getOne(id);
    return await this.ventaRepo.delete(venta.id);
  }
}