import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from '../../cliente/model/cliente.model';
import { Usuario } from '../../usuario/model/usuario.model';
import { VentaDetalle } from './venta-detalle.model';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn({ name: 'venta_id' })
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  numero!: string;

  @Column({ type: 'date' })
  fecha!: Date;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column({ name: 'cliente_id' })
  clienteId!: number;

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

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado!: string; // pendiente, pagado, anulado

  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => VentaDetalle, detalle => detalle.venta, { cascade: true })
  detalles!: VentaDetalle[];
}