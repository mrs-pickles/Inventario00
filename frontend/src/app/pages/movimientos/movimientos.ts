import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

import { AuthService } from '../../auth/auth.service';
import { MovimientoService, type MovimientoApi } from '../../services/movimiento.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TooltipModule,
    DialogModule,
  ],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
})
export class Movimientos implements OnInit {
  private movimientoService = inject(MovimientoService);
  private productoService = inject(ProductoService);
  private auth = inject(AuthService);

  /** Movimientos de entrada (COMPRA y ENTRADA); no incluye SALIDA. */
  compras: MovimientoApi[] = [];
  productosOpciones: { id: number; nombre: string }[] = [];

  cargando = true;
  errorMsg: string | null = null;
  mostrarFormulario = false;

  formProductoId: number | null = null;
  formCantidad = 1;
  formPrecioCompra = 0;

  ngOnInit() {
    this.cargar();
    this.cargarProductos();
  }

  cargar() {
    this.cargando = true;
    this.errorMsg = null;
    this.movimientoService
      .getAll()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => {
          const list = Array.isArray(data) ? data : [];
          this.compras = list
            .map((raw: Record<string, unknown>) =>
              this.normalizarMovimiento(raw),
            )
            .filter(
              (m) => m.tipo === 'COMPRA' || m.tipo === 'ENTRADA',
            )
            .sort((a, b) => {
              const fa = new Date(a.fecha).getTime();
              const fb = new Date(b.fecha).getTime();
              return fb - fa;
            });
        },
        error: (e) => {
          this.errorMsg =
            e?.error?.message ||
            'No se pudo cargar los movimientos. Compruebe el servidor.';
          this.compras = [];
        },
      });
  }

  private normalizarMovimiento(raw: Record<string, unknown>): MovimientoApi {
    const pc =
      raw['precioCompra'] != null
        ? Number(raw['precioCompra'])
        : raw['precio_compra'] != null
          ? Number(raw['precio_compra'])
          : null;
    const prod = raw['producto'] as Record<string, unknown> | undefined;
    return {
      id: Number(raw['id']),
      tipo: String(raw['tipo'] ?? ''),
      cantidad: Number(raw['cantidad']) || 0,
      precioCompra: Number.isFinite(pc) ? pc : null,
      fecha: String(raw['fecha'] ?? ''),
      producto: prod
        ? {
            id: Number(prod['id']),
            nombre: String(prod['nombre'] ?? ''),
            stock:
              prod['stock'] != null ? Number(prod['stock']) : undefined,
          }
        : undefined,
      usuario: raw['usuario'] as MovimientoApi['usuario'],
    };
  }

  cargarProductos() {
    this.productoService.getAll().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.productosOpciones = list.map((p: { id: number; nombre: string }) => ({
          id: p.id,
          nombre: p.nombre,
        }));
      },
      error: () => {
        this.productosOpciones = [];
      },
    });
  }

  moneda(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
  }

  precioUnitario(m: MovimientoApi): number {
    return Number(m.precioCompra) || 0;
  }

  totalLinea(m: MovimientoApi): number {
    return Math.round(Number(m.cantidad) * this.precioUnitario(m) * 100) / 100;
  }

  stockProducto(m: MovimientoApi): number {
    return Math.floor(Number(m.producto?.stock)) || 0;
  }

  etiquetaTipo(m: MovimientoApi): string {
    if (m.tipo === 'COMPRA') {
      return 'Compra';
    }
    if (m.tipo === 'ENTRADA') {
      return 'Entrada';
    }
    return m.tipo || '—';
  }

  formatFecha(raw: string | undefined): string {
    if (!raw) {
      return '—';
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return '—';
    }
    return d.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  abrirRegistrar() {
    this.formProductoId = this.productosOpciones[0]?.id ?? null;
    this.formCantidad = 1;
    this.formPrecioCompra = 0;
    this.mostrarFormulario = true;
  }

  cerrarForm() {
    this.mostrarFormulario = false;
  }

  guardarCompra() {
    const perfil = this.auth.getProfile();
    if (!perfil?.id) {
      alert('No hay usuario en sesión. Vuelva a iniciar sesión.');
      return;
    }
    if (!this.formProductoId) {
      alert('Seleccione un producto.');
      return;
    }
    if (this.formCantidad < 1) {
      alert('La cantidad de compra debe ser al menos 1.');
      return;
    }
    if (this.formPrecioCompra < 0) {
      alert('El precio de compra no puede ser negativo.');
      return;
    }

    this.movimientoService
      .createCompra({
        tipo: 'COMPRA',
        cantidad: Math.floor(this.formCantidad),
        precioCompra: Number(this.formPrecioCompra),
        producto: this.formProductoId,
        usuario: perfil.id,
      })
      .subscribe({
        next: () => {
          this.cerrarForm();
          this.cargar();
          this.cargarProductos();
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            err?.message ||
            'No se pudo registrar la compra.';
          alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
        },
      });
  }
}
