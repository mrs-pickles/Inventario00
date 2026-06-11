import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompraController } from './compra.controller';
import { CompraService } from './compra.service';
import { Compra } from './model/compra.model';
import { CompraDetalle } from './model/compra-detalle.model';
import { Proveedor } from '../proveedor/model/proveedor.model';
import { Producto } from '../producto/model/producto.model';
import { Movimiento } from '../movimiento/model/movimiento.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compra, CompraDetalle, Proveedor, Producto, Movimiento])
  ],
  controllers: [CompraController],
  providers: [CompraService],
  exports: [CompraService],
})
export class CompraModule {}