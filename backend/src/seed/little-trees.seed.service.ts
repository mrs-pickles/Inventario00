import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';

import { Categoria } from '../categoria/model/categoria.model';
import { Movimiento } from '../movimiento/model/movimiento.model';
import { Producto } from '../producto/model/producto.model';

const PROVEEDOR_LT = 'Car-Freshner Corporation (Little Trees)';
/** Marca en descripción para poder reemplazar el catálogo semillado sin tocar datos ajenos. */
const MARCA_SEMILLA = '【LT-CAT-V4】';

const INTRO_CATALOGO = `Línea Little Trees – aromatizantes colgantes originales. Refresca tu auto con estilo y personalidad. Fragancias intensas y duraderas; elige tu aroma y dale un toque único a cada viaje. En catálogo y movimientos desde febrero 2025.`;

/** Categorías antiguas (sin emoji): se vacían si solo había semilla Little Trees. */
const CATEGORIAS_LEGACY = [
  'Dulces y frutales',
  'Florales y suaves',
  'Frescos y naturales',
  'Intensos y especiales',
  'Diseños y ediciones especiales',
] as const;

/** Títulos v3 con emoji (para limpiar categorías huérfanas tras migración). */
const CATEGORIAS_EMOJI_LEGACY = [
  '🍒 DULCES & FRUTALES',
  '🌸 FLORALES & SUAVES',
  '🌿 FRESCOS & NATURALES',
  '🔥 INTENSOS & ESPECIALES',
  '🎨 DISEÑOS & EDICIONES ESPECIALES',
] as const;

type GrupoSemilla = {
  categoria: string;
  slug: string;
  nombres: string[];
};

const GRUPOS: GrupoSemilla[] = [
  {
    categoria: 'DULCES & FRUTALES',
    slug: 'DUL',
    nombres: [
      'Cereza / Wild Cherry',
      'Fresa',
      'Manzana y Canela',
      'Sandía',
      'Piña Colada',
      'Coco Playa / Coco Naranja',
      'Algodón de Azúcar',
      'Bubble Gum',
      'Peachy Peach / Peach Ginger Spritz',
      'Margarita',
      'Torta de Cumpleaños',
      'Pitahaya Morada',
    ],
  },
  {
    categoria: 'FLORALES & SUAVES',
    slug: 'FLO',
    nombres: [
      'Cherry Blossom Honey',
      'Flores Rosas (Mañana)',
      'Rosa Roja',
      'Jazmín',
      'Lavanda',
    ],
  },
  {
    categoria: 'FRESCOS & NATURALES',
    slug: 'FRE',
    nombres: [
      'Morning Fresh',
      'Fresh Shave',
      'Royal Pine',
      'True North',
      'Limón Amarillo / Lemon Grove',
      'Summer Linen',
      'Rainforest Mist',
      'Bayside Breeze',
      'Rainshine',
    ],
  },
  {
    categoria: 'INTENSOS & ESPECIALES',
    slug: 'INT',
    nombres: [
      'Ice Black',
      'Be King',
      'Gold',
      'No Smoke',
      'Leather',
      'Blackberry Clove',
      'Calabaza, Anís y Canela',
      'Copper Canyon',
      'Atardecer',
      'Super Nova',
      'New Car',
      'Moroccan Mint Tea',
      'Metal',
    ],
  },
  {
    categoria: 'DISEÑOS & EDICIONES ESPECIALES',
    slug: 'DIS',
    nombres: [
      'Bandera Americana',
      'Bandera Americana Vanilla Pride',
      'Barco Turquesa',
      'Calavera Negra Tatuaje',
      'Corset Negro (Morado)',
    ],
  },
];

const CODIGO_PRIMER_PRODUCTO = `LT4-${GRUPOS[0].slug}-01`;

@Injectable()
export class LittleTreesSeedService implements OnModuleInit {
  private readonly log = new Logger(LittleTreesSeedService.name);

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async onModuleInit() {
    const yaCompleto = await this.productoRepo.count({
      where: { codigo: CODIGO_PRIMER_PRODUCTO },
    });
    if (yaCompleto > 0) {
      this.log.log('Catálogo Little Trees v4 ya cargado, omitiendo sembrado.');
      return;
    }

    await this.quitarSemillasAnteriores();
    await this.insertarCatalogoV4();
  }

  /** Quita productos semilla Little Trees (y movimientos asociados) para evitar duplicados. */
  private async quitarSemillasAnteriores() {
    const candidatos = await this.productoRepo.find({
      where: [
        { proveedor: PROVEEDOR_LT },
        { codigo: Like('LT3-%') },
        { codigo: Like('LT4-%') },
        { descripcion: Like('%【LT-CAT-V3】%') },
        { descripcion: Like('%【LT-CAT-V4】%') },
      ],
      select: ['id'],
    });
    const ids = candidatos.map((p) => p.id);
    if (ids.length === 0) {
      return;
    }
    await this.movimientoRepo
      .createQueryBuilder()
      .delete()
      .from(Movimiento)
      .where('producto_id IN (:...ids)', { ids })
      .execute();
    await this.productoRepo.delete({ id: In(ids) });
    this.log.log(`Retirados ${ids.length} productos semilla Little Trees (y sus movimientos).`);

    const nombresCats = new Set<string>([
      ...CATEGORIAS_LEGACY,
      ...CATEGORIAS_EMOJI_LEGACY,
      ...GRUPOS.map((g) => g.categoria),
    ]);
    for (const nombre of nombresCats) {
      const cat = await this.categoriaRepo.findOne({ where: { nombre } });
      if (!cat) {
        continue;
      }
      const restantes = await this.productoRepo.count({
        where: { categoria: { id: cat.id } },
      });
      if (restantes === 0) {
        await this.categoriaRepo.delete(cat.id);
      }
    }
  }

  private async insertarCatalogoV4() {
    let creados = 0;
    let skuN = 1;
    for (const grupo of GRUPOS) {
      let categoria = await this.categoriaRepo.findOne({
        where: { nombre: grupo.categoria },
      });
      if (!categoria) {
        categoria = await this.categoriaRepo.save(
          this.categoriaRepo.create({ nombre: grupo.categoria }),
        );
        this.log.log(`Categoría: ${grupo.categoria}`);
      }
      let idx = 1;
      for (const nombre of grupo.nombres) {
        const codigo = `LT4-${grupo.slug}-${String(idx).padStart(2, '0')}`;
        const existeCodigo = await this.productoRepo.exist({ where: { codigo } });
        if (existeCodigo) {
          idx++;
          continue;
        }
        const precio = 12 + (skuN % 9) * 2.5;
        const costo = Math.round(precio * 0.72 * 100) / 100;
        const stock = 18 + (skuN * 7) % 95;
        const p = this.productoRepo.create({
          nombre: nombre.trim(),
          codigo,
          sku: `LT4-${String(skuN).padStart(5, '0')}`,
          origen: 'USA / importación',
          descripcion: `${INTRO_CATALOGO} Familia: ${grupo.categoria}. ${MARCA_SEMILLA}`,
          stockMinimo: 5,
          proveedor: PROVEEDOR_LT,
          imagen: null,
          costo,
          precio,
          stock,
          activo: true,
          categoria,
        });
        await this.productoRepo.save(p);
        creados++;
        skuN++;
        idx++;
      }
    }
    this.log.log(
      `Sembrado Little Trees v4: ${creados} productos en ${GRUPOS.length} familias de aroma.`,
    );
  }
}
