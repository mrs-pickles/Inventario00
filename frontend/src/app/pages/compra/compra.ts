import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

import { CompraService } from '../../services/compra.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ProductoService } from '../../services/producto.service';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    TooltipModule,
    TagModule,
    SelectModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './compra.html',
  styleUrl: './compra.css',
})
export class Compra implements OnInit {
  private compraService = inject(CompraService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private messageService = inject(MessageService);

  compras: any[] = [];
  cargando = true;
  errorMsg: string | null = null;
  searchText = '';

  mostrarFormulario = false;
  proveedores: any[] = [];
  productos: any[] = [];

  nuevaCompra = {
    proveedorId: null as number | null,
    descuento: 0,
    observacion: '',
    detalles: [] as any[],
  };

  productoSeleccionado: any = null;
  cantidadSeleccionada = 1;
  precioCompra: number = 0;

  pagina = 0;
  filasPorPagina = 10;

  ngOnInit() {
    this.cargarCompras();
    this.cargarProveedores();
    this.cargarProductos();
  }

  cargarCompras() {
    this.cargando = true;
    this.compraService.getAll().subscribe({
      next: (data: any) => {
        this.compras = Array.isArray(data) ? data : [];
        this.cargando = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar compras';
        this.cargando = false;
      },
    });
  }

  cargarProveedores() {
    this.proveedorService.getAll().subscribe({
      next: (data: any) => {
        this.proveedores = Array.isArray(data) ? data.filter((p: any) => p.activo !== false) : [];
      },
      error: () => console.error('Error al cargar proveedores'),
    });
  }

  cargarProductos() {
    this.productoService.getAll().subscribe({
      next: (data: any) => {
        this.productos = Array.isArray(data) ? data : [];
      },
      error: () => console.error('Error al cargar productos'),
    });
  }

  get comprasVista() {
    const t = this.searchText.trim().toLowerCase();
    let list = this.compras.filter((c) => {
      if (!t) return true;
      return (
        (c.numero || '').toLowerCase().includes(t) ||
        (c.proveedor?.nombre || '').toLowerCase().includes(t) ||
        c.total?.toString().includes(t)
      );
    });
    return list;
  }

  get totalFiltrados() {
    return this.comprasVista.length;
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.filasPorPagina));
  }

  get comprasPagina() {
    const start = this.pagina * this.filasPorPagina;
    return this.comprasVista.slice(start, start + this.filasPorPagina);
  }

  get paginaReporte() {
    const n = this.totalFiltrados;
    if (n === 0) return '0 compras';
    const first = this.pagina * this.filasPorPagina + 1;
    const last = Math.min(n, (this.pagina + 1) * this.filasPorPagina);
    return `Mostrando ${first} a ${last} de ${n} compras`;
  }

  onFilasPorPaginaChange(n: number) {
    this.filasPorPagina = n;
    this.pagina = 0;
  }

  paginaAnterior() {
    if (this.pagina > 0) this.pagina--;
  }

  paginaSiguiente() {
    if (this.pagina < this.totalPaginas - 1) this.pagina++;
  }

  onBusquedaCambiada() {
    this.pagina = 0;
  }

  abrirNuevaCompra() {
    this.nuevaCompra = {
      proveedorId: null,
      descuento: 0,
      observacion: '',
      detalles: [],
    };
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    this.precioCompra = 0;
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  agregarProducto() {
    if (!this.productoSeleccionado || this.cantidadSeleccionada <= 0) return;
    if (!this.precioCompra || this.precioCompra <= 0) {
      this.errorMsg = 'Ingrese un precio unitario válido';
      return;
    }

    const existente = this.nuevaCompra.detalles.find((d: any) => d.productoId === this.productoSeleccionado);
    if (existente) {
      existente.cantidad += this.cantidadSeleccionada;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      this.nuevaCompra.detalles.push({
        productoId: this.productoSeleccionado,
        productoNombre: this.productos.find(p => p.id === this.productoSeleccionado)?.nombre,
        cantidad: this.cantidadSeleccionada,
        precioUnitario: this.precioCompra,
        subtotal: this.cantidadSeleccionada * this.precioCompra,
      });
    }

    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    this.precioCompra = 0;
    this.errorMsg = null;
  }

  quitarProducto(index: number) {
    this.nuevaCompra.detalles.splice(index, 1);
  }

  get subtotal() {
    return this.nuevaCompra.detalles.reduce((sum, d) => sum + d.subtotal, 0);
  }

  get total() {
    return this.subtotal - (this.nuevaCompra.descuento || 0);
  }

  guardarCompra() {
  if (!this.nuevaCompra.proveedorId) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione un proveedor' });
    return;
  }
  if (this.nuevaCompra.detalles.length === 0) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Agregue al menos un producto' });
    return;
  }

  const data = {
    proveedorId: this.nuevaCompra.proveedorId,
    descuento: this.nuevaCompra.descuento || 0,
    observacion: this.nuevaCompra.observacion,
    detalles: this.nuevaCompra.detalles.map((d: any) => ({
      productoId: d.productoId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
    })),
  };

  this.compraService.create(data).subscribe({
    next: () => {
      this.cargarCompras();
      this.cerrarFormulario();
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Compra registrada correctamente' });
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear la compra' });
    },
  });
}

  anularCompra(id: number) {
  if (confirm('¿Anular esta compra? Se revertirá el stock.')) {
    this.compraService.anular(id).subscribe({
      next: () => {
        this.cargarCompras();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Compra anulada correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al anular la compra' });
      },
    });
  }
}

  getEstadoBadge(estado: string): 'success' | 'info' | 'danger' | 'warn' | 'secondary' | 'contrast' | null | undefined {
    switch (estado) {
      case 'completada': return 'success';
      case 'anulada': return 'danger';
      default: return 'info';
    }
  }

  moneda(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
  }

  fechaFormato(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-BO');
  }
}