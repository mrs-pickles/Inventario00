import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { VentaService } from './venta.service';
import { VentaDto } from './dto/venta.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Get()
  getAll() {
    return this.ventaService.getAll();
  }

  @Get('historial')
  getHistorial(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.ventaService.getHistorial(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.ventaService.getOne(Number(id));
  }

  @Post()
  create(@Body() data: VentaDto) {
    return this.ventaService.create(data);
  }

  @Put(':id/anular')
  anular(@Param('id') id: string) {
    return this.ventaService.anular(Number(id));
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.ventaService.delete(Number(id));
  }
}