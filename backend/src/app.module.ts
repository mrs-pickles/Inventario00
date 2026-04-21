import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UsuarioController } from './usuario/usuario.controller';
import ormConfig from './config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario/model/usuario.model';
import { ConfigModule } from '@nestjs/config';
import { UsuarioService } from './usuario/usuario.service';
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



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: ormConfig
    }),
    TypeOrmModule.forFeature([Usuario, Categoria, Producto, Movimiento]),
    AuthModule
  ],
  controllers: [
    //AppController, 
    UsuarioController,
    ProductoController,
    CategoriaController,
    MovimientoController
  ],
  providers: [
    // AppService
    UsuarioService,
    ProductoService,
    CategoriaService,
    MovimientoService
  ],
})
export class AppModule {}

