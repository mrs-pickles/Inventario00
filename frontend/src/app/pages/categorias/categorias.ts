import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

import {
  CategoriaService,
  type CategoriaListado,
} from '../../services/categoria.service';
import { catchError, of, switchMap } from 'rxjs';

type OrdenNombre = 'az' | 'za';

/** Familias del catálogo Little Trees (referencia en pantalla). */
const FAMILIAS_CATALOGO_LT = [
  'DULCES & FRUTALES',
  'FLORALES & SUAVES',
  'FRESCOS & NATURALES',
  'INTENSOS & ESPECIALES',
  'DISEÑOS & EDICIONES ESPECIALES',
] as const;

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    DialogModule,
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  private categoriaService = inject(CategoriaService);

  categorias: CategoriaListado[] = [];
  readonly familiasCatalogoLt = [...FAMILIAS_CATALOGO_LT];
  searchText = '';
  orden: OrdenNombre = 'az';
  cargando = true;
  errorCarga: string | null = null;
  mostrarFormulario = false;

  formNombre = '';
  formId = 0;
  editando = false;

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.cargando = true;
    this.errorCarga = null;
    this.categoriaService
      .getAll()
      .pipe(
        catchError((err) => {
          this.errorCarga =
            err?.error?.message ||
            'No se pudo cargar la lista de categorías. Compruebe la API.';
          return of([] as { id: number; nombre: string }[]);
        }),
        switchMap((data: unknown) => {
          const base = Array.isArray(data)
            ? (data as { id: number; nombre: string }[]).map((c) => ({
                id: Number(c.id),
                nombre: String(c.nombre ?? ''),
                cantidad: 0,
              }))
            : [];
          return this.categoriaService.getListadoConConteo().pipe(
            catchError(() => of([] as CategoriaListado[])),
            switchMap((listado) => {
              const byId = new Map<number, number>();
              for (const row of listado) {
                byId.set(row.id, row.cantidad);
              }
              const merged = base.map((c) => ({
                ...c,
                cantidad: byId.get(c.id) ?? 0,
              }));
              return of(merged);
            }),
          );
        }),
      )
      .subscribe({
        next: (rows) => {
          this.categorias = rows;
          this.cargando = false;
        },
        error: () => {
          this.categorias = [];
          this.cargando = false;
        },
      });
  }

  get filas(): CategoriaListado[] {
    const t = this.searchText.trim().toLowerCase();
    let list = t
      ? this.categorias.filter((c) => c.nombre.toLowerCase().includes(t))
      : [...this.categorias];
    list.sort((a, b) => {
      const r = a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
      return this.orden === 'az' ? r : -r;
    });
    return list;
  }

  setOrden(ord: OrdenNombre) {
    this.orden = ord;
  }

  toggleOrden() {
    this.orden = this.orden === 'az' ? 'za' : 'az';
  }

  abrirCrear() {
    this.formId = 0;
    this.formNombre = '';
    this.editando = false;
    this.mostrarFormulario = true;
  }

  abrirEditar(c: CategoriaListado) {
    this.formId = c.id;
    this.formNombre = c.nombre;
    this.editando = true;
    this.mostrarFormulario = true;
  }

  cerrarDialogo() {
    this.mostrarFormulario = false;
    this.resetForm();
  }

  onDialogHide() {
    this.resetForm();
  }

  resetForm() {
    this.formId = 0;
    this.formNombre = '';
    this.editando = false;
  }

  guardarCategoria() {
    const nombre = this.formNombre.trim();
    if (!nombre) {
      return;
    }
    const data = { nombre };

    if (this.editando) {
      this.categoriaService.update(this.formId, data).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarDialogo();
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar'),
      });
    } else {
      this.categoriaService.create(data).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarDialogo();
        },
        error: (err) => alert(err.error?.message || 'Error al guardar'),
      });
    }
  }

  eliminarCategoria(c: CategoriaListado) {
    if (c.cantidad > 0) {
      if (
        !confirm(
          `Esta categoría tiene ${c.cantidad} producto(s). ¿Eliminar de todos modos? (fallará si hay restricción en la base)`,
        )
      ) {
        return;
      }
    } else if (!confirm('¿Eliminar esta categoría?')) {
      return;
    }
    this.categoriaService.delete(c.id).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) =>
        alert(
          err.error?.message || 'No se pudo eliminar. ¿Hay productos asignados?',
        ),
    });
  }
}
