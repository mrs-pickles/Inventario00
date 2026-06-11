import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Proveedor } from '../../proveedor/model/proveedor.model';
import { Usuario } from '../../usuario/model/usuario.model';
import { CompraDetalle } from './compra-detalle.model';

@Entity()
export class Compra {
  @PrimaryGeneratedColumn({ name: 'compra_id' })
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  numero!: string;

  @Column({ type: 'date' })
  fecha!: Date;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: Proveedor;

  @Column({ name: 'proveedor_id' })
  proveedorId!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ name: 'usuario_id' })
  usuarioId!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  descuento!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'varchar', length: 20, default: 'completada' })
  estado!: string; // completada, anulada

  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => CompraDetalle, detalle => detalle.compra, { cascade: true })
  detalles!: CompraDetalle[];
}