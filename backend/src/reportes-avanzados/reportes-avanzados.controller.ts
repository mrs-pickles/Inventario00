import { Controller, Get, Query } from '@nestjs/common';
import { ReportesAvanzadosService } from './reportes-avanzados.service';

@Controller('reportes-avanzados')
export class ReportesAvanzadosController {
  constructor(private readonly reportesService: ReportesAvanzadosService) {}

  @Get('ventas')
  getReporteVentas(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('agrupacion') agrupacion?: 'dia' | 'mes' | 'año',
  ) {
    return this.reportesService.getReporteVentas(fechaInicio, fechaFin, agrupacion);
  }

  @Get('productos-mas-vendidos')
  getProductosMasVendidos(@Query('limite') limite?: string) {
    return this.reportesService.getProductosMasVendidos(Number(limite) || 10);
  }

  @Get('ganancias')
  getReporteGanancias(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.reportesService.getReporteGanancias(fechaInicio, fechaFin);
  }

  @Get('stock-bajo')
  getStockBajo(@Query('limite') limite?: string) {
    return this.reportesService.getStockBajo(Number(limite) || 20);
  }

  @Get('movimientos')
  getReporteMovimientos(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('tipo') tipo?: 'entrada' | 'salida',
  ) {
    return this.reportesService.getReporteMovimientos(fechaInicio, fechaFin, tipo);
  }
}