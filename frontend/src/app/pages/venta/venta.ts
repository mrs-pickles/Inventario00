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

import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-venta',
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
  templateUrl: './venta.html',
  styleUrl: './venta.css',
})
export class Venta implements OnInit {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  private messageService = inject(MessageService);

  ventas: any[] = [];
  cargando = true;
  errorMsg: string | null = null;
  searchText = '';

  // Nueva venta
  mostrarFormulario = false;
  clientes: any[] = [];
  productos: any[] = [];

  nuevaVenta = {
    clienteId: null as number | null,
    descuento: 0,
    observacion: '',
    detalles: [] as any[],
  };

  productoSeleccionado: any = null;
  cantidadSeleccionada = 1;
  precioVenta: number = 0;

  // Paginación
  pagina = 0;
  filasPorPagina = 10;

  ngOnInit() {
    this.cargarVentas();
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarVentas() {
    this.cargando = true;
    this.ventaService.getAll().subscribe({
      next: (data: any) => {
        this.ventas = Array.isArray(data) ? data : [];
        this.cargando = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar ventas';
        this.cargando = false;
      },
    });
  }

  cargarClientes() {
    this.clienteService.getAll().subscribe({
      next: (data: any) => {
        this.clientes = Array.isArray(data) ? data.filter((c: any) => c.activo !== false) : [];
      },
      error: () => console.error('Error al cargar clientes'),
    });
  }

  cargarProductos() {
    this.productoService.getAll().subscribe({
      next: (data: any) => {
        this.productos = Array.isArray(data) ? data.filter((p: any) => p.activo !== false && p.stock > 0) : [];
      },
      error: () => console.error('Error al cargar productos'),
    });
  }

  get ventasVista() {
    const t = this.searchText.trim().toLowerCase();
    let list = this.ventas.filter((v) => {
      if (!t) return true;
      return (
        (v.numero || '').toLowerCase().includes(t) ||
        (v.cliente?.nombre || '').toLowerCase().includes(t) ||
        v.total?.toString().includes(t)
      );
    });
    return list;
  }

  get totalFiltrados() {
    return this.ventasVista.length;
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.filasPorPagina));
  }

  get ventasPagina() {
    const start = this.pagina * this.filasPorPagina;
    return this.ventasVista.slice(start, start + this.filasPorPagina);
  }

  get paginaReporte() {
    const n = this.totalFiltrados;
    if (n === 0) return '0 ventas';
    const first = this.pagina * this.filasPorPagina + 1;
    const last = Math.min(n, (this.pagina + 1) * this.filasPorPagina);
    return `Mostrando ${first} a ${last} de ${n} ventas`;
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

  abrirNuevaVenta() {
    this.nuevaVenta = {
      clienteId: null,
      descuento: 0,
      observacion: '',
      detalles: [],
    };
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    this.precioVenta = 0;
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  agregarProducto() {
    if (!this.productoSeleccionado || this.cantidadSeleccionada <= 0) return;
    if (this.cantidadSeleccionada > this.productoSeleccionado.stock) {
      this.errorMsg = `Stock insuficiente. Máximo: ${this.productoSeleccionado.stock}`;
      return;
    }

    const existente = this.nuevaVenta.detalles.find((d: any) => d.productoId === this.productoSeleccionado);
    if (existente) {
      existente.cantidad += this.cantidadSeleccionada;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      this.nuevaVenta.detalles.push({
        productoId: this.productoSeleccionado,
        productoNombre: this.productos.find(p => p.id === this.productoSeleccionado)?.nombre,
        cantidad: this.cantidadSeleccionada,
        precioUnitario: this.precioVenta,
        subtotal: this.cantidadSeleccionada * this.precioVenta,
      });
    }

    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    this.precioVenta = 0;
    this.errorMsg = null;
  }

  quitarProducto(index: number) {
    this.nuevaVenta.detalles.splice(index, 1);
  }

  get subtotal() {
    return this.nuevaVenta.detalles.reduce((sum, d) => sum + d.subtotal, 0);
  }

  get total() {
    return this.subtotal - (this.nuevaVenta.descuento || 0);
  }

  guardarVenta() {
  if (!this.nuevaVenta.clienteId) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione un cliente' });
    return;
  }
  if (this.nuevaVenta.detalles.length === 0) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Agregue al menos un producto' });
    return;
  }

  const data = {
    clienteId: this.nuevaVenta.clienteId,
    descuento: this.nuevaVenta.descuento || 0,
    observacion: this.nuevaVenta.observacion,
    detalles: this.nuevaVenta.detalles.map((d: any) => ({
      productoId: d.productoId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
    })),
  };

  this.ventaService.create(data).subscribe({
    next: () => {
      this.cargarVentas();
      this.cerrarFormulario();
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Venta registrada correctamente' });
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear la venta' });
    },
  });
}

  anularVenta(id: number) {
  if (confirm('¿Anular esta venta? Se revertirá el stock.')) {
    this.ventaService.anular(id).subscribe({
      next: () => {
        this.cargarVentas();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Venta anulada correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al anular la venta' });
      },
    });
  }
}

  getEstadoBadge(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null | undefined {
    switch (estado) {
      case 'pagado': return 'success';
      case 'anulado': return 'danger';
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