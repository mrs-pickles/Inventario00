import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';

const ORDEN_CATEGORIAS = [
  'DULCES & FRUTALES',
  'FLORALES & SUAVES',
  'FRESCOS & NATURALES',
  'INTENSOS & ESPECIALES',
  'DISEÑOS & EDICIONES ESPECIALES',
];

/** La API / datos antiguos usan estos nombres; los unificamos al título del catálogo. */
const TITULO_CANONICO: Record<string, string> = {
  'Dulces y frutales': 'DULCES & FRUTALES',
  'Florales y suaves': 'FLORALES & SUAVES',
  'Frescos y naturales': 'FRESCOS & NATURALES',
  'Intensos y especiales': 'INTENSOS & ESPECIALES',
  'Diseños y ediciones especiales': 'DISEÑOS & EDICIONES ESPECIALES',
  '🍒 DULCES & FRUTALES': 'DULCES & FRUTALES',
  '🌸 FLORALES & SUAVES': 'FLORALES & SUAVES',
  '🌿 FRESCOS & NATURALES': 'FRESCOS & NATURALES',
  '🔥 INTENSOS & ESPECIALES': 'INTENSOS & ESPECIALES',
  '🎨 DISEÑOS & EDICIONES ESPECIALES': 'DISEÑOS & EDICIONES ESPECIALES',
};

export type GrupoCatalogo = {
  nombre: string;
  productos: { id: number; nombre: string; precio: number }[];
};

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  private productoService = inject(ProductoService);

  cargando = true;
  errorMsg: string | null = null;
  grupos: GrupoCatalogo[] = [];

  readonly tituloMarca = 'Little Trees – Aromatizantes originales';
  readonly leadMarca =
    'Refresca tu auto con estilo y personalidad. Los Little Trees llenan tu vehículo de aromas irresistibles y duraderos: diseños icónicos, fragancias intensas y ese toque que hace que cada viaje se sienta distinto. Catálogo operativo en el sistema desde febrero 2025.';

  /** Familias del catálogo (misma orden que las secciones de productos). */
  readonly familiasCatalogo = [...ORDEN_CATEGORIAS];

  cantidadEnFamilia(nombre: string): number {
    return this.grupos.find((g) => g.nombre === nombre)?.productos.length ?? 0;
  }

  ngOnInit() {
    this.productoService.getAll().subscribe({
      next: (data) => {
        const list = Array.isArray(data)
          ? (data as {
              id: number;
              nombre: string;
              precio: number;
              categoria?: { nombre: string };
            }[])
          : [];
        this.reagrupar(list);
        this.cargando = false;
      },
      error: (e) => {
        this.errorMsg =
          e?.error?.message || 'No se pudo cargar el catálogo. Compruebe el servidor.';
        this.cargando = false;
        this.reagrupar([]);
      },
    });
  }

  private reagrupar(
    list: { id: number; nombre: string; precio: number; categoria?: { nombre: string } }[],
  ) {
    const map = new Map<string, { id: number; nombre: string; precio: number }[]>();
    for (const p of list) {
      const raw = p.categoria?.nombre?.trim() || 'Sin categoría';
      const cat = TITULO_CANONICO[raw] ?? raw;
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push({
        id: Number(p.id) || 0,
        nombre: p.nombre,
        precio: Number(p.precio) || 0,
      });
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
    }
    const out: GrupoCatalogo[] = [];
    for (const nombre of ORDEN_CATEGORIAS) {
      const items = map.get(nombre);
      if (items?.length) {
        out.push({ nombre, productos: items });
      }
    }
    for (const nombre of map.keys()) {
      if (!ORDEN_CATEGORIAS.includes(nombre)) {
        out.push({ nombre, productos: map.get(nombre)! });
      }
    }
    this.grupos = out;
  }
}
