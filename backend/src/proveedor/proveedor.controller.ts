import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { ProveedorService } from './proveedor.service';
import { ProveedorDto } from './dto/proveedor.dto';

@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Get()
  getAll() {
    return this.proveedorService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.proveedorService.getOne(Number(id));
  }

  @Post()
  create(@Body() data: ProveedorDto) {
    return this.proveedorService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: ProveedorDto) {
    return this.proveedorService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.proveedorService.delete(Number(id));
  }
}