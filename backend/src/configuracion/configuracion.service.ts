import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Configuracion } from './model/configuracion.model';
import { ConfiguracionDto } from './dto/configuracion.dto';

@Injectable()
export class ConfiguracionService {
  constructor(
    @InjectRepository(Configuracion)
    private readonly configRepo: Repository<Configuracion>,
  ) {}

  async getAll() {
    return await this.configRepo.find();
  }

  async getByClave(clave: string) {
    const config = await this.configRepo.findOne({ where: { clave } });
    if (!config) return null;
    
    // Parsear según el tipo
    if (config.tipo === 'number') return { ...config, valor: Number(config.valor) };
    if (config.tipo === 'boolean') return { ...config, valor: config.valor === 'true' };
    if (config.tipo === 'json') return { ...config, valor: JSON.parse(config.valor || '{}') };
    return config;
  }

  async create(data: ConfiguracionDto) {
    let valorString = data.valor;
    if (data.tipo === 'json' && typeof data.valor !== 'string') {
      valorString = JSON.stringify(data.valor);
    } else if (data.tipo === 'boolean') {
      valorString = String(data.valor);
    } else if (data.tipo === 'number') {
      valorString = String(data.valor);
    }

    const config = this.configRepo.create({
      clave: data.clave,
      valor: valorString,
      descripcion: data.descripcion || null,
      tipo: data.tipo || 'string',
      updatedAt: new Date(),
    });
    return await this.configRepo.save(config);
  }

  async update(clave: string, data: ConfiguracionDto) {
    let config = await this.configRepo.findOne({ where: { clave } });
    if (!config) throw new Error(`Configuración ${clave} no existe`);

    if (data.valor !== undefined) {
      let valorString = data.valor;
      if (config.tipo === 'json' && typeof data.valor !== 'string') {
        valorString = JSON.stringify(data.valor);
      } else if (config.tipo === 'boolean') {
        valorString = String(data.valor);
      } else if (config.tipo === 'number') {
        valorString = String(data.valor);
      } else {
        valorString = String(data.valor);
      }
      config.valor = valorString;
    }
    if (data.descripcion !== undefined) config.descripcion = data.descripcion;
    config.updatedAt = new Date();

    return await this.configRepo.save(config);
  }

  async delete(clave: string) {
    const config = await this.configRepo.findOne({ where: { clave } });
    if (!config) throw new Error(`Configuración ${clave} no existe`);
    return await this.configRepo.delete(config.id);
  }
}