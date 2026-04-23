import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

import { finalize } from 'rxjs';

import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';

type Orden = 'nombre' | 'precio' | 'categoria' | 'costo' | 'sku';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToggleSwitchModule,
    SelectModule,
    TagModule,
    TooltipModule,
    DialogModule,
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  productos: any[] = [];
  categorias: any[] = [];

  cargando = true;
  errorMsg: string | null = null;

  searchText = '';
  orden: Orden = 'nombre';
  ordenAsc = true;
  mostrarFormulario = false;

  /** Paginación local (tabla HTML; evita fallos de render de p-table en algunos entornos). */
  pagina = 0;
  filasPorPagina = 10;

  nuevoProducto = {
    id: 0,
    nombre: '',
    codigo: '',
    sku: '',
    origen: '',
    descripcion: '',
    stock: 0,
    categoriaId: null as number | null,
    imagen: '' as string,
    costo: 0,
    precio: 0,
    stockMinimo: 0,
    proveedor: '',
    activo: true,
  };

  editando = false;

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  sku(p: { id: number; sku?: string | null }): string {
    const s = p.sku?.toString().trim();
    if (s) {
      return s;
    }
    return 'PRD-' + String(p.id).padStart(6, '0');
  }

  moneda(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
  }

  get productosVista(): any[] {
    const t = this.searchText.trim().toLowerCase();
    let list = this.productos.filter((p) => {
      if (!t) {
        return true;
      }
      return (
        (p.nombre ?? '').toLowerCase().includes(t) ||
        (p.categoria?.nombre ?? '').toLowerCase().includes(t) ||
        this.sku(p).toLowerCase().includes(t) ||
        String(p.codigo ?? '').toLowerCase().includes(t) ||
        String(p.origen ?? '').toLowerCase().includes(t) ||
        String(p.proveedor ?? '').toLowerCase().includes(t)
      );
    });
    const dir = this.ordenAsc ? 1 : -1;
    const byNombre = (a: any, b: any) =>
      (a.nombre || '').localeCompare(b.nombre || 'es', 'es', {
        sensitivity: 'base',
      });
    const byCategoria = (a: any, b: any) =>
      (a.categoria?.nombre || '').localeCompare(
        b.categoria?.nombre || '',
        'es',
        { sensitivity: 'base' },
      );
    list = [...list];
    if (this.orden === 'nombre') {
      list.sort((a, b) => byNombre(a, b) * dir);
    } else if (this.orden === 'categoria') {
      list.sort((a, b) => byCategoria(a, b) * dir);
    } else if (this.orden === 'precio' || this.orden === 'costo') {
      const key = this.orden;
      list.sort(
        (a, b) => (Number(a[key]) - Number(b[key])) * dir,
      );
    } else if (this.orden === 'sku') {
      list.sort((a, b) => (a.id - b.id) * dir);
    }
    return list;
  }

  get totalFiltrados(): number {
    return this.productosVista.length;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.filasPorPagina));
  }

  get productosPagina(): any[] {
    const start = this.pagina * this.filasPorPagina;
    return this.productosVista.slice(start, start + this.filasPorPagina);
  }

  get paginaReporte(): string {
    const n = this.totalFiltrados;
    if (n === 0) {
      return '0 productos';
    }
    const first = this.pagina * this.filasPorPagina + 1;
    const last = Math.min(n, (this.pagina + 1) * this.filasPorPagina);
    return `Mostrando ${first} a ${last} de ${n} productos`;
  }

  setOrden(campo: Orden) {
    this.pagina = 0;
    if (this.orden === campo) {
      this.ordenAsc = !this.ordenAsc;
    } else {
      this.orden = campo;
      this.ordenAsc = true;
    }
  }

  onBusquedaCambiada() {
    this.pagina = 0;
  }

  onFilasPorPaginaChange(n: number) {
    const v = [10, 25, 50].includes(Number(n)) ? Number(n) : 10;
    this.filasPorPagina = v;
    this.pagina = 0;
  }

  private ajustarPagina() {
    const max = Math.max(0, this.totalPaginas - 1);
    if (this.pagina > max) {
      this.pagina = max;
    }
  }

  paginaAnterior() {
    if (this.pagina > 0) {
      this.pagina--;
    }
  }

  paginaSiguiente() {
    if (this.pagina < this.totalPaginas - 1) {
      this.pagina++;
    }
  }

  abrirCrear() {
    this.resetFormulario();
    this.mostrarFormulario = true;
  }

  abrirEditar(p: any) {
    this.editarProducto(p);
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.resetFormulario();
  }

  onDialogHide() {
    this.resetFormulario();
  }

  cargarProductos() {
    this.errorMsg = null;
    this.cargando = true;
    this.productoService
      .getAll()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data: unknown) => {
          this.pagina = 0;
          const list = Array.isArray(data) ? data : [];
          this.productos = list.map((p: any) => {
            const prec = Number(p.precio) || 0;
            const costoNum =
              p.costo != null && p.costo !== ''
                ? Number(p.costo)
                : Math.round(prec * 0.88 * 100) / 100;
            return {
              ...p,
              activo: p.activo !== false,
              costo: costoNum,
            };
          });
          if (!Array.isArray(data)) {
            this.errorMsg =
              'La respuesta del servidor no es una lista de productos. Compruebe la API (/api/producto).';
          }
          this.ajustarPagina();
          this.cdr.markForCheck();
        },
        error: (e: any) => {
          this.productos = [];
          this.pagina = 0;
          this.errorMsg =
            e?.error?.message ||
            e?.message ||
            'No se pudo cargar la lista de productos. Compruebe que la API esté en marcha y la ruta /api/producto.';
          this.cdr.markForCheck();
        },
      });
  }

  cargarCategorias() {
    this.categoriaService.getAll().subscribe((data: any) => {
      this.categorias = data;
    });
  }

  onFileImagen(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const f = el.files?.[0];
    if (!f || !f.type.startsWith('image/')) {
      el.value = '';
      return;
    }
    if (f.size > 1_500_000) {
      el.value = '';
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      this.nuevoProducto.imagen = String(r.result || '');
    };
    r.readAsDataURL(f);
    el.value = '';
  }

  quitarImagen() {
    this.nuevoProducto.imagen = '';
  }

  private buildPayload() {
    return {
      nombre: this.nuevoProducto.nombre.trim(),
      codigo: this.nuevoProducto.codigo.trim() || undefined,
      sku: this.nuevoProducto.sku.trim() || undefined,
      origen: this.nuevoProducto.origen.trim() || undefined,
      descripcion: this.nuevoProducto.descripcion.trim() || undefined,
      stockMinimo: Math.max(0, Math.floor(Number(this.nuevoProducto.stockMinimo) || 0)),
      proveedor: this.nuevoProducto.proveedor.trim() || undefined,
      imagen: this.nuevoProducto.imagen.trim() || undefined,
      costo: Number(this.nuevoProducto.costo),
      precio: Number(this.nuevoProducto.precio),
      stock: Number(this.nuevoProducto.stock),
      categoriaId: Number(this.nuevoProducto.categoriaId),
      activo: this.nuevoProducto.activo,
    };
  }

  private payloadDesdeFila(p: any, activo?: boolean) {
    const pr = Number(p.precio) || 0;
    const c =
      p.costo != null && p.costo !== '' ? Number(p.costo) : Math.round(pr * 0.88 * 100) / 100;
    return {
      nombre: p.nombre,
      codigo: p.codigo == null || p.codigo === '' ? undefined : String(p.codigo),
      sku: p.sku == null || p.sku === '' ? undefined : String(p.sku),
      origen: p.origen == null || p.origen === '' ? undefined : String(p.origen),
      descripcion: p.descripcion == null || p.descripcion === '' ? undefined : String(p.descripcion),
      stockMinimo: Math.max(0, Math.floor(Number(p.stockMinimo) || 0)),
      proveedor: p.proveedor == null || p.proveedor === '' ? undefined : String(p.proveedor),
      imagen: p.imagen == null || p.imagen === '' ? undefined : String(p.imagen),
      costo: c,
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoria.id,
      activo: activo !== undefined ? activo : p.activo !== false,
    };
  }

  guardarProducto() {
    if (!this.nuevoProducto.nombre.trim()) {
      return;
    }
    if (this.nuevoProducto.categoriaId == null || this.nuevoProducto.categoriaId === 0) {
      return;
    }

    const data = this.buildPayload();

    if (this.editando) {
      this.productoService.update(this.nuevoProducto.id, data).subscribe({
        next: () => {
          this.cargarProductos();
          this.mostrarFormulario = false;
          this.resetFormulario();
        },
        error: (err) => console.error('ERROR UPDATE', err),
      });
    } else {
      this.productoService.create(data).subscribe({
        next: () => {
          this.cargarProductos();
          this.mostrarFormulario = false;
          this.resetFormulario();
        },
        error: (err) => console.error('ERROR CREATE', err),
      });
    }
  }

  editarProducto(p: any) {
    const pr = Number(p.precio) || 0;
    this.nuevoProducto = {
      id: p.id,
      nombre: p.nombre,
      codigo: p.codigo ?? '',
      sku: p.sku ?? '',
      origen: p.origen ?? '',
      descripcion: p.descripcion ?? '',
      stock: p.stock,
      categoriaId: p.categoria?.id ?? null,
      imagen: p.imagen ?? '',
      costo: p.costo != null && p.costo !== '' ? Number(p.costo) : Math.round(pr * 0.88 * 100) / 100,
      precio: p.precio,
      stockMinimo: p.stockMinimo != null ? Math.floor(Number(p.stockMinimo)) : 0,
      proveedor: p.proveedor ?? '',
      activo: p.activo !== false,
    };
    this.editando = true;
  }

  onActivoChange(activo: boolean, p: any) {
    if (!p.categoria?.id) {
      return;
    }
    this.productoService
      .update(p.id, this.payloadDesdeFila(p, activo) as any)
      .subscribe({ next: () => this.cargarProductos() });
  }

  eliminarProducto(id: number) {
    this.productoService.delete(id).subscribe(() => {
      this.productos = this.productos.filter((p) => p.id !== id);
      this.ajustarPagina();
      this.cdr.markForCheck();
    });
  }

  resetFormulario() {
    this.nuevoProducto = {
      id: 0,
      nombre: '',
      codigo: '',
      sku: '',
      origen: '',
      descripcion: '',
      stock: 0,
      categoriaId: null,
      imagen: '',
      costo: 0,
      precio: 0,
      stockMinimo: 0,
      proveedor: '',
      activo: true,
    };
    this.editando = false;
  }
}
