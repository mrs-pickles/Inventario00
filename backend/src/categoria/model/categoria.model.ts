import {Entity,PrimaryGeneratedColumn,Column,OneToMany} from 'typeorm';

import { Producto } from '../../producto/model/producto.model';

@Entity()
export class Categoria {

    @PrimaryGeneratedColumn({ name: 'categoria_id' })
    id!: number;

    @Column({ unique: true })
    nombre!: string;

    @OneToMany(() => Producto,producto => producto.categoria
    )
    productos!: Producto[];
}