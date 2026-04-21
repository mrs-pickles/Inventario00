import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn} from 'typeorm';
import { Producto } from '../../producto/model/producto.model';
import { Usuario } from '../../usuario/model/usuario.model';

@Entity()
export class Movimiento {
  @PrimaryGeneratedColumn({ name: 'movimiento_id' })
  id!: number;

  @Column()
  tipo!: string; // ENTRADA / SALIDA

  @Column()
  cantidad!: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  fecha!: Date;

  @ManyToOne(() => Producto,producto => producto.movimientos)
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @ManyToOne(() => Usuario,usuario => usuario.movimientos)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}