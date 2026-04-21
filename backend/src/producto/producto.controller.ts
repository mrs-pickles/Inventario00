import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param
} from '@nestjs/common';

import { ProductoService } from './producto.service';
import { ProductoDto } from './dto/producto.dto';

@Controller('producto') // 👉 ruta: /api/producto
export class ProductoController {

  constructor(private readonly productoService: ProductoService) {}

  // 🔹 LISTAR
  @Get()
  getAll() {
    return this.productoService.getAll();
  }

  // 🔹 CREAR
  @Post()
  create(@Body() data: ProductoDto) {
    return this.productoService.create(data);
  }

  // 🔹 ACTUALIZAR
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: ProductoDto
  ) {
    return this.productoService.update(Number(id), data);
  }

  // 🔹 ELIMINAR
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productoService.delete(Number(id));
  }
}