import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from './model/usuario.model';
import { UsuarioDto } from './dto/usuario.dto';

@Injectable()
export class UsuarioService {

    constructor(
        @InjectRepository(Usuario)
        private readonly repository: Repository<Usuario>
    ) {}

    async getAll() {
        return await this.repository.find({
            relations: ['movimientos']
        });
    }

    async getById(id: number) {
        return await this.findById(id);
    }

    async create(data: UsuarioDto) {
        const entity = this.repository.create(data);

        await this.repository.save(entity);

        return 'Usuario guardado correctamente';
    }

    async update(id: number, data: UsuarioDto) {

        const usuario = await this.findById(id);

        if (!usuario) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }

        await this.repository.update({ id }, data);

        return 'Usuario actualizado correctamente';
    }

    async delete(id: number) {

        const usuario = await this.findById(id);

        if (!usuario) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }

        await this.repository.delete(id);

        return 'Usuario eliminado correctamente';
    }

    private async findById(id: number) {
        return await this.repository.findOne({
            where: { id },
            relations: ['movimientos']
        });
    }
}