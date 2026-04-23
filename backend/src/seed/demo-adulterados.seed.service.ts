import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Categoria } from '../categoria/model/categoria.model';
import { Producto } from '../producto/model/producto.model';

const CATEGORIA_DEMO = '⚠️ Demo — datos ficticios (no usar en producción)';

/** Productos con valores claramente irreales para pruebas de UI y listados. */
const PRODUCTOS_ADULTERADOS: {
  nombre: string;
  codigo: string;
  sku: string;
  precio: number;
  costo: number;
  stock: number;
}[] = [
  {
    nombre: 'ZZZ — artículo sin origen verificable (demo)',
    codigo: 'DEMO-FAKE-01',
    sku: 'DEMO-00001',
    precio: 999999.99,
    costo: 1,
    stock: 888,
  },
  {
    nombre: 'Lata “Premium” con peso dudoso 0 kg',
    codigo: 'DEMO-FAKE-02',
    sku: 'DEMO-00002',
    precio: 0.01,
    costo: 0,
    stock: 99999,
  },
  {
    nombre: 'Perfume genérico ∞ ml (etiqueta ilegible)',
    codigo: 'DEMO-FAKE-03',
    sku: 'DEMO-00003',
    precio: 12345.67,
    costo: 99.99,
    stock: 3,
  },
  {
    nombre: 'Código de barras inventado 0000000000000',
    codigo: 'DEMO-FAKE-04',
    sku: 'DEMO-00004',
    precio: 7.77,
    costo: 7.77,
    stock: 0,
  },
  {
    nombre: 'Pack “oferta” precio negociado mal cargado',
    codigo: 'DEMO-FAKE-05',
    sku: 'DEMO-00005',
    precio: 0,
    costo: 500,
    stock: 42,
  },
  {
    nombre: 'Producto duplicado fantasma (mismo SKU viejo)',
    codigo: 'DEMO-FAKE-06',
    sku: 'DEMO-DUP-001',
    precio: 3333.33,
    costo: 1000,
    stock: 1,
  },
  {
    nombre: 'Bebida energética “Turbo” caducidad: nunca',
    codigo: 'DEMO-FAKE-07',
    sku: 'DEMO-00007',
    precio: 88.88,
    costo: 12.34,
    stock: 5000,
  },
  {
    nombre: 'Caja vacía vendida como surtido',
    codigo: 'DEMO-FAKE-08',
    sku: 'DEMO-00008',
    precio: 49.5,
    costo: 0.01,
    stock: 77,
  },
];

const MARCA_DESCRIPCION =
  '【DEMO-ADULTERADO】 Datos ficticios generados automáticamente para pruebas. No representan productos reales ni precios de mercado.';

@Injectable()
export class DemoAdulteradosSeedService implements OnModuleInit {
  private readonly log = new Logger(DemoAdulteradosSeedService.name);

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async onModuleInit() {
    const existe = await this.productoRepo.exist({
      where: { codigo: 'DEMO-FAKE-01' },
    });
    if (existe) {
      this.log.log('Semilla demo adulterada ya presente, omitiendo.');
      return;
    }

    let cat = await this.categoriaRepo.findOne({
      where: { nombre: CATEGORIA_DEMO },
    });
    if (!cat) {
      cat = await this.categoriaRepo.save(
        this.categoriaRepo.create({ nombre: CATEGORIA_DEMO }),
      );
      this.log.log(`Categoría demo: ${CATEGORIA_DEMO}`);
    }

    for (const row of PRODUCTOS_ADULTERADOS) {
      await this.productoRepo.save(
        this.productoRepo.create({
          nombre: row.nombre,
          codigo: row.codigo,
          sku: row.sku,
          origen: 'Inventado / QA',
          descripcion: MARCA_DESCRIPCION,
          stockMinimo: 0,
          proveedor: 'Semilla sistema — datos no válidos comercialmente',
          imagen: null,
          costo: row.costo,
          precio: row.precio,
          stock: row.stock,
          activo: true,
          categoria: cat,
        }),
      );
    }

    this.log.log(
      `Insertados ${PRODUCTOS_ADULTERADOS.length} productos demo adulterados en «${CATEGORIA_DEMO}».`,
    );
  }
}
