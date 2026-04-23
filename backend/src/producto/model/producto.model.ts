import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';

import { Categoria } from '../../categoria/model/categoria.model';
import { Movimiento } from '../../movimiento/model/movimiento.model';

@Entity()
export class Producto {

  @PrimaryGeneratedColumn({ name: 'producto_id' })
  id!: number;

  @Column()
  nombre!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  codigo!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sku!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  origen!: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'stock_minimo', default: 0 })
  stockMinimo!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  proveedor!: string | null;

  @Column({ type: 'text', nullable: true })
  imagen!: string | null;

  @Column('decimal', { name: 'costo', default: 0 })
  costo!: number;

  @Column('decimal')
  precio!: number;

  @Column()
  stock!: number;

  @Column({ name: 'activo', default: true })
  activo!: boolean;

  // 🔹 MUCHOS productos pertenecen a UNA categoría
  @ManyToOne(() => Categoria, categoria => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria!: Categoria;

  // 🔹 UN producto tiene MUCHOS movimientos
  @OneToMany(() => Movimiento, movimiento => movimiento.producto)
  movimientos!: Movimiento[];
}