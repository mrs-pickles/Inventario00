import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Producto } from "src/producto/model/producto.model";
import { Categoria } from "src/categoria/model/categoria.model";
import { Movimiento} from "src/movimiento/model/movimiento.model";
import { Usuario} from "src/usuario/model/usuario.model";

export default registerAs(
    'orm.config',
    (): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5223,
        username: 'inventario',
        password: '1844',
        database: 'inventario-db',
        entities: [Usuario, Producto, Categoria, Movimiento],
        synchronize: true,
    }),
);