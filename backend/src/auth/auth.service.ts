import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from '../usuario/model/usuario.model';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly jwtService: JwtService
    ) {}

    async login(data: LoginDto) {

        const usuario = await this.usuarioRepository.findOne({
            where: { email: data.email }
        });

        if (!usuario) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        if (usuario.password !== data.password) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        const payload = {
            sub: usuario.id,
            email: usuario.email,
            name: usuario.name
        };

        return {
        access_token: this.jwtService.sign(payload),
        usuario: {

           id: usuario.id,
           name: usuario.name,
           email: usuario.email
        }
        };

        /*return {
            access_token: this.jwtService.sign(payload),
            usuario
        };*/
    }
}