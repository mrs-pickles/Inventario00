import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { ClienteService } from './cliente.service';
import { ClienteDto } from './dto/cliente.dto';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  getAll() {
    return this.clienteService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.clienteService.getOne(Number(id));
  }

  @Post()
  create(@Body() data: ClienteDto) {
    return this.clienteService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: ClienteDto) {
    return this.clienteService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clienteService.delete(Number(id));
  }
}