import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentaController } from './venta.controller';
import { VentaService } from './venta.service';
import { Venta } from './model/venta.model';
import { VentaDetalle } from './model/venta-detalle.model';
import { Cliente } from '../cliente/model/cliente.model';
import { Producto } from '../producto/model/producto.model';
import { Movimiento } from '../movimiento/model/movimiento.model';
import { Usuario } from '../usuario/model/usuario.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, VentaDetalle, Cliente, Producto, Movimiento, Usuario])
  ],
  controllers: [VentaController],
  providers: [VentaService],
  exports: [VentaService],
})
export class VentaModule {}