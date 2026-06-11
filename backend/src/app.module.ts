import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UsuarioController } from './usuario/usuario.controller';
import ormConfig from './config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario/model/usuario.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsuarioService } from './usuario/usuario.service';
import { UsuarioSeedService } from './usuario/usuario.seed.service';
import { LittleTreesSeedService } from './seed/little-trees.seed.service';
import { DemoAdulteradosSeedService } from './seed/demo-adulterados.seed.service';
import { Producto } from './producto/model/producto.model';
import { Categoria } from './categoria/model/categoria.model';
import { ProductoController } from './producto/producto.controller';
import {  ProductoService } from './producto/producto.service';
import { CategoriaController } from './categoria/categoria.controller';
import { CategoriaService } from './categoria/categoria.service';
import { AuthModule } from './auth/auth.module';
import { Movimiento } from './movimiento/model/movimiento.model';
import { MovimientoController } from './movimiento/movimiento.controller';
import { MovimientoService} from './movimiento/movimiento.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { VentaModule } from './venta/venta.module';
import { Cliente } from './cliente/model/cliente.model';
import { Proveedor } from './proveedor/model/proveedor.model';
import { CompraModule } from './compra/compra.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { Configuracion } from './configuracion/model/configuracion.model';
import { ReportesAvanzadosModule } from './reportes-avanzados/reportes-avanzados.module';


import { Venta } from './venta/model/venta.model';
import { VentaDetalle } from './venta/model/venta-detalle.model';
import { Compra } from './compra/model/compra.model';
import { CompraDetalle } from './compra/model/compra-detalle.model';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const opts = config.get<TypeOrmModuleOptions>('orm.config');
        if (!opts) {
          throw new Error('orm.config no está definido');
        }
        return opts;
      },
    }),
    TypeOrmModule.forFeature([Usuario, Categoria, Producto, Movimiento, Cliente, Proveedor, Configuracion, Venta, VentaDetalle, Compra, CompraDetalle]),
    AuthModule,
    ClienteModule,
    ProveedorModule,
    VentaModule,
    CompraModule,
    ConfiguracionModule,
    ReportesAvanzadosModule
  ],
  controllers: [
    //AppController, 
    UsuarioController,
    ProductoController,
    CategoriaController,
    MovimientoController,
  
  ],
  providers: [
    // AppService
    UsuarioService,
    UsuarioSeedService,
    LittleTreesSeedService,
    DemoAdulteradosSeedService,
    ProductoService,
    CategoriaService,
    MovimientoService
  ],
})
export class AppModule {}

