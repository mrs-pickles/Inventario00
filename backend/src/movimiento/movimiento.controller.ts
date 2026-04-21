import {Body,Controller,Delete,Get,Param,ParseIntPipe,Post} from '@nestjs/common';
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