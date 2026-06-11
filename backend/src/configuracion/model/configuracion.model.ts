import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Configuracion {
  @PrimaryGeneratedColumn({ name: 'config_id' })
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  clave!: string;

  @Column({ type: 'text', nullable: true })
  valor!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'string' })
  tipo!: string; // string, number, boolean, json

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}