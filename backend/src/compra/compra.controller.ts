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

import { CompraService } from './compra.service';
import { CompraDto } from './dto/compra.dto';

@Controller('compra')
export class CompraController {
  constructor(private readonly compraService: CompraService) {}

  @Get()
  getAll() {
    return this.compraService.getAll();
  }

  @Get('historial')
  getHistorial(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.compraService.getHistorial(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.compraService.getOne(Number(id));
  }

  @Post()
  create(@Body() data: CompraDto) {
    return this.compraService.create(data);
  }

  @Put(':id/anular')
  anular(@Param('id') id: string) {
    return this.compraService.anular(Number(id));
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.compraService.delete(Number(id));
  }
}