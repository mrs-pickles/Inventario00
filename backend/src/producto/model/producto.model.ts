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

  @Column('decimal')
  precio!: number;

  @Column()
  stock!: number;

  // 🔹 MUCHOS productos pertenecen a UNA categoría
  @ManyToOne(() => Categoria, categoria => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria!: Categoria;

  // 🔹 UN producto tiene MUCHOS movimientos
  @OneToMany(() => Movimiento, movimiento => movimiento.producto)
  movimientos!: Movimiento[];
}