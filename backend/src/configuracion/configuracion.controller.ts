import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { ConfiguracionService } from './configuracion.service';
import { ConfiguracionDto } from './dto/configuracion.dto';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configService: ConfiguracionService) {}

  @Get()
  getAll() {
    return this.configService.getAll();
  }

  @Get(':clave')
  getByClave(@Param('clave') clave: string) {
    return this.configService.getByClave(clave);
  }

  @Post()
  create(@Body() data: ConfiguracionDto) {
    return this.configService.create(data);
  }

  @Put(':clave')
  update(@Param('clave') clave: string, @Body() data: ConfiguracionDto) {
    return this.configService.update(clave, data);
  }

  @Delete(':clave')
  delete(@Param('clave') clave: string) {
    return this.configService.delete(clave);
  }
}