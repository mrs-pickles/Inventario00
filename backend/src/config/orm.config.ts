import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Producto } from "src/producto/model/producto.model";
import { Categoria } from "src/categoria/model/categoria.model";
import { Movimiento} from "src/movimiento/model/movimiento.model";
import { Usuario} from "src/usuario/model/usuario.model";
import { Cliente } from "src/cliente/model/cliente.model";
import { Proveedor } from "src/proveedor/model/proveedor.model";
import { Configuracion } from "src/configuracion/model/configuracion.model";
import { Venta } from "src/venta/model/venta.model";
import { VentaDetalle } from "src/venta/model/venta-detalle.model";
import { Compra } from "src/compra/model/compra.model";
import { CompraDetalle } from "src/compra/model/compra-detalle.model";

function intEnv(name: string, defaultValue: string): number {
  const v = process.env[name] ?? defaultValue;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : parseInt(defaultValue, 10);
}

export default registerAs(
    'orm.config',
    (): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: intEnv('DB_PORT', '5223'),
        username: process.env.DB_USER ?? 'inventario',
        password: process.env.DB_PASSWORD ?? '1844',
        database: process.env.DB_NAME ?? 'inventario-db',
        entities: [Usuario, Producto, Categoria, Movimiento, Cliente, Proveedor, Configuracion, Venta, VentaDetalle, Compra, CompraDetalle],
        synchronize: (process.env.DB_SYNC ?? 'true') !== 'false',
    }),
);


/*
import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Producto } from "src/producto/model/producto.model";
import { Categoria } from "src/categoria/model/categoria.model";
import { Movimiento} from "src/movimiento/model/movimiento.model";
import { Usuario} from "src/usuario/model/usuario.model";
import { Cliente } from "src/cliente/model/cliente.model";
import { Proveedor } from "src/proveedor/model/proveedor.model";
import { Configuracion } from "src/configuracion/model/configuracion.model";
import { Venta } from "src/venta/model/venta.model";
import { VentaDetalle } from "src/venta/model/venta-detalle.model";
import { Compra } from "src/compra/model/compra.model";
import { CompraDetalle } from "src/compra/model/compra-detalle.model";

export default registerAs(
    'orm.config',
    (): TypeOrmModuleOptions => {
        // Si existe DATABASE_URL, usarla (Railway)
        if (process.env.DATABASE_URL) {
            return {
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [Usuario, Producto, Categoria, Movimiento, Cliente, Proveedor, Configuracion, Venta, VentaDetalle, Compra, CompraDetalle],
                synchronize: true,
                ssl: false,
            };
        }
        
        // Si no, usar variables individuales (local)
        return {
            type: 'postgres',
            host: process.env.DB_HOST ?? '127.0.0.1',
            port: parseInt(process.env.DB_PORT ?? '5223'),
            username: process.env.DB_USER ?? 'inventario',
            password: process.env.DB_PASSWORD ?? '1844',
            database: process.env.DB_NAME ?? 'inventario-db',
            entities: [Usuario, Producto, Categoria, Movimiento, Cliente, Proveedor, Configuracion, Venta, VentaDetalle, Compra, CompraDetalle],
            synchronize: (process.env.DB_SYNC ?? 'true') !== 'false',
        };
    },
);*/