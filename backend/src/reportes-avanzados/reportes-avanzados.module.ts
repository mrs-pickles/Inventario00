import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportesAvanzadosController } from './reportes-avanzados.controller';
import { ReportesAvanzadosService } from './reportes-avanzados.service';
import { Venta } from '../venta/model/venta.model';
import { VentaDetalle } from '../venta/model/venta-detalle.model';
import { Producto } from '../producto/model/producto.model';
import { Movimiento } from '../movimiento/model/movimiento.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, VentaDetalle, Producto, Movimiento])
  ],
  controllers: [ReportesAvanzadosController],
  providers: [ReportesAvanzadosService],
  exports: [ReportesAvanzadosService],
})
export class ReportesAvanzadosModule {}