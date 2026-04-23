import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of, timeout } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { ProductoService } from '../../services/producto.service';

export type FilaExistencia = {
  id: number;
  nombre: string;
  sku: string;
  categoria: string;
  cantidad: number;
  valor: number;
};

/** Filas de ejemplo: total y columnas alineados (sin depender de la API). */
const FILAS_DEMO: FilaExistencia[] = [
  {
    id: 10001,
    nombre: 'Cereza / Wild Cherry',
    sku: 'LT4-00001',
    categoria: 'DULCES & FRUTALES',
    cantidad: 48,
    valor: 936.0,
  },
  {
    id: 10002,
    nombre: 'Royal Pine',
    sku: 'LT4-00020',
    categoria: 'FRESCOS & NATURALES',
    cantidad: 36,
    valor: 720.0,
  },
  {
    id: 10003,
    nombre: 'New Car',
    sku: 'LT4-00037',
    categoria: 'INTENSOS & ESPECIALES',
    cantidad: 52,
    valor: 1066.0,
  },
  {
    id: 10004,
    nombre: 'Cherry Blossom Honey',
    sku: 'LT4-00013',
    categoria: 'FLORALES & SUAVES',
    cantidad: 24,
    valor: 456.0,
  },
  {
    id: 10005,
    nombre: 'Bandera Americana',
    sku: 'LT4-00040',
    categoria: 'DISEÑOS & EDICIONES ESPECIALES',
    cantidad: 15,
    valor: 300.0,
  },
  {
    id: 10006,
    nombre: 'Ice Black',
    sku: 'LT4-00027',
    categoria: 'INTENSOS & ESPECIALES',
    cantidad: 30,
    valor: 615.0,
  },
];

function totalDesdeFilas(f: FilaExistencia[]): number {
  return Math.round(f.reduce((s, r) => s + r.valor, 0) * 100) / 100;
}

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './reporte.html',
  styleUrl: './reporte.css',
})
export class Reporte implements OnInit {
  private producto = inject(ProductoService);

  cargando = true;
  errorMsg: string | null = null;
  /** Aviso no bloqueante (p. ej. listado de ejemplo). */
  avisoReporte: string | null = null;
  existenciasTotalBs = 0;
  filas: FilaExistencia[] = [];
  searchText = '';
  /** True cuando se listan `FILAS_DEMO` (sin stock real en el servidor). */
  esDemostracion = false;

  /**
   * Copia de la tabla antes de cada "Actualizar" para no perder la vista
   * si el servidor responde vacío o con error puntu.
   */
  private reservaAnteActualizacion: {
    filas: FilaExistencia[];
    total: number;
    eraReal: boolean;
  } | null = null;

  constructor() {
    this.filas = FILAS_DEMO.map((f) => ({ ...f }));
    this.existenciasTotalBs = totalDesdeFilas(this.filas);
    this.esDemostracion = true;
    this.avisoReporte = 'Cargando inventario real. Mientras tanto se muestran filas de ejemplo.';
    this.cargando = false;
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.errorMsg = null;
    this.reservaAnteActualizacion =
      this.filas.length > 0
        ? {
            filas: this.filas.map((f) => ({ ...f })),
            total: this.existenciasTotalBs,
            eraReal: !this.esDemostracion,
          }
        : null;

    this.producto
      .getInformeExistencias()
      .pipe(
        timeout(12000),
        catchError((e) => {
          if (e?.name === 'TimeoutError' || e?.name === 'TimeoutError') {
            this.errorMsg =
              'El servidor no respondió a tiempo. Revisando el listado de productos…';
            return of({ existenciasTotalBs: 0, filas: [] as FilaExistencia[] });
          }
          this.errorMsg =
            e?.error?.message ||
            (e?.status
              ? `Error ${e.status} al cargar el informe`
              : 'No se pudo cargar el informe. Comprobá el backend.');
          return of({ existenciasTotalBs: 0, filas: [] as FilaExistencia[] });
        }),
      )
      .subscribe({
        next: (r) => {
        const filas = Array.isArray((r as { filas?: FilaExistencia[] })?.filas)
          ? (r as { filas: FilaExistencia[] }).filas
          : [];
        const total = Number((r as { existenciasTotalBs?: number })?.existenciasTotalBs) || 0;
        if (filas.length > 0) {
          this.filas = filas;
          this.existenciasTotalBs = Math.round(total * 100) / 100;
          this.cargando = false;
          this.esDemostracion = false;
          this.avisoReporte = null;
          this.reservaAnteActualizacion = null;
          return;
        }
        this.cargarRespaldoListado();
        },
      });
  }

  /**
   * Si el endpoint de informe falla o viene vacío, se arma el mismo cálculo
   * desde /producto (listado) para no quedar en blanco.
   */
  private cargarRespaldoListado() {
    this.producto.getAll().subscribe({
      next: (list) => {
        this.filas = this.mapearProductosALista(list);
        this.existenciasTotalBs = totalDesdeFilas(this.filas);
        this.cargando = false;
        if (this.filas.length > 0) {
          this.esDemostracion = false;
          if (this.errorMsg) {
            this.errorMsg = null;
          }
          this.reservaAnteActualizacion = null;
        } else {
          this.recuperarOVoltearADemo(
            'Inventario vacío: se muestran filas y totales de ejemplo (aromas de referencia).',
            false,
          );
        }
      },
      error: (e) => {
        this.cargando = false;
        const detalle =
          e?.error?.message ||
          e?.message ||
          (e?.status ? `Error ${e.status}` : 'No se pudo conectar a http://localhost:3000');
        this.recuperarOVoltearADemo(
          `${detalle} Se rellenan el informe y el resumen con datos de demostración si no había otra vista guardada.`,
          true,
        );
      },
    });
  }

  /**
   * Tras un refresco, si el servidor dejó 0 filas, conservamos la vista anterior
   * si existía; si no, demo o solo mensaje con error.
   */
  private recuperarOVoltearADemo(
    avisoODetalle: string,
    conError: boolean,
  ) {
    const b = this.reservaAnteActualizacion;
    this.reservaAnteActualizacion = null;
    if (b && b.filas.length > 0) {
      this.filas = b.filas;
      this.existenciasTotalBs = b.total;
      this.esDemostracion = !b.eraReal;
      if (conError) {
        this.errorMsg = `No se pudo actualizar. ${avisoODetalle}`;
        this.avisoReporte = 'Se conserva la lista que estaba en pantalla.';
      } else {
        this.errorMsg = null;
        this.avisoReporte =
          'Al actualizar el inventario vino vacío. Se mantiene la vista anterior.';
      }
    } else {
      this.aplicarDatosDemostracion(avisoODetalle, conError);
    }
  }

  private aplicarDatosDemostracion(aviso: string, conError: boolean) {
    this.filas = FILAS_DEMO.map((f) => ({ ...f }));
    this.existenciasTotalBs = totalDesdeFilas(this.filas);
    this.esDemostracion = true;
    this.avisoReporte = conError ? null : aviso;
    this.errorMsg = conError ? aviso : null;
  }

  private mapearProductosALista(raw: unknown): FilaExistencia[] {
    if (!Array.isArray(raw) || !raw.length) {
      return [];
    }
    const out: FilaExistencia[] = [];
    for (const p of raw) {
      const o = p as {
        id: number;
        nombre: string;
        sku?: string | null;
        categoria?: { nombre?: string } | null;
        precio?: string | number;
        stock?: string | number;
      };
      if (o == null || o.nombre == null) {
        continue;
      }
      const prec = Number(o.precio) || 0;
      const st = Math.floor(Number(o.stock)) || 0;
      const valor = Math.round(prec * st * 100) / 100;
      const skuVal = o.sku?.toString().trim();
      const sku = skuVal || 'PRD-' + String(o.id).padStart(6, '0');
      out.push({
        id: o.id,
        nombre: o.nombre,
        sku,
        categoria: o.categoria?.nombre?.trim() || '—',
        cantidad: st,
        valor,
      });
    }
    return out.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }

  get filasVista(): FilaExistencia[] {
    const t = this.searchText.trim().toLowerCase();
    if (!t) {
      return this.filas;
    }
    return this.filas.filter(
      (f) =>
        f.nombre.toLowerCase().includes(t) ||
        f.sku.toLowerCase().includes(t) ||
        f.categoria.toLowerCase().includes(t),
    );
  }

  moneda(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
  }

  int(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);
  }
}
