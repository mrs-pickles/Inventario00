import {Entity,PrimaryGeneratedColumn,Column,OneToMany} from 'typeorm';
import { Movimiento } from '../../movimiento/model/movimiento.model';

@Entity()
export class Usuario {

    @PrimaryGeneratedColumn({ name: 'usuario_id' })
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @OneToMany(() => Movimiento,movimiento => movimiento.usuario)
    movimientos!: Movimiento[];
}