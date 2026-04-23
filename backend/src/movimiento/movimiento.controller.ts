import { Body,Controller,Delete,Get,Param,ParseIntPipe,Post,Query,BadRequestException,} from '@nestjs/common';
import { MovimientoDto } from './dto/movimiento.dto';
import { MovimientoService } from './movimiento.service';

@Controller('movimiento')
export class MovimientoController {

  constructor(
    private readonly service: MovimientoService
  ) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get('estadisticas/ventas-mes')
  getVentasPorMes(
    @Query('year') yearParam?: string,
  ) {
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Año no válido');
    }
    return this.service.getVentasPorMes(year);
  }

  @Get('estadisticas/top-productos')
  getTopProductosVendidos(
    @Query('year') yearParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Año no válido');
    }
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    if (Number.isNaN(limit)) {
      throw new BadRequestException('Límite no válido');
    }
    return this.service.getTopProductosVendidos(year, limit);
  }

  @Get('estadisticas/entradas-salidas-mes')
  getEntradasSalidasPorMes(
    @Query('year') yearParam?: string,
  ) {
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Año no válido');
    }
    return this.service.getEntradasSalidasPorMes(year);
  }

  @Get('estadisticas/ganancias-mes')
  getGananciasPorMes(
    @Query('year') yearParam?: string,
  ) {
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Año no válido');
    }
    return this.service.getGananciasPorMes(year);
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number
  ) {
      return this.service.getById(id);
  }

  @Post()
  create(
    @Body() data: MovimientoDto
  ) {
    return this.service.create(data);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number
  ) {
    
    return this.service.delete(id);
  }
}