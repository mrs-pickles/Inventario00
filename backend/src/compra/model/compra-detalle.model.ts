import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Compra } from './compra.model';
import { Producto } from '../../producto/model/producto.model';

@Entity()
export class CompraDetalle {
  @PrimaryGeneratedColumn({ name: 'compra_detalle_id' })
  id!: number;

  @ManyToOne(() => Compra, compra => compra.detalles)
  @JoinColumn({ name: 'compra_id' })
  compra!: Compra;

  @Column({ name: 'compra_id' })
  compraId!: number;

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