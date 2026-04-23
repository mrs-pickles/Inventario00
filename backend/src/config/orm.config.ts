import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Producto } from "src/producto/model/producto.model";
import { Categoria } from "src/categoria/model/categoria.model";
import { Movimiento} from "src/movimiento/model/movimiento.model";
import { Usuario} from "src/usuario/model/usuario.model";

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
        entities: [Usuario, Producto, Categoria, Movimiento],
        synchronize: (process.env.DB_SYNC ?? 'true') !== 'false',
    }),
);
