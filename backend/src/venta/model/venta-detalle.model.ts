import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.model';
import { Producto } from '../../producto/model/producto.model';

@Entity()
export class VentaDetalle {
  @PrimaryGeneratedColumn({ name: 'venta_detalle_id' })
  id!: number;

  @ManyToOne(() => Venta, venta => venta.detalles)
  @JoinColumn({ name: 'venta_id' })
  venta!: Venta;

  @Column({ name: 'venta_id' })
  ventaId!: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @Column({ name: 'producto_id' })
  productoId!: number;

  @Column()
  cantidad!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;
}