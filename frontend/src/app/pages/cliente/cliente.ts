import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

import { ClienteService } from '../../services/cliente.service';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TooltipModule,
    TagModule,
    ToastModule,
  ],
   providers: [MessageService], 
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class Cliente implements OnInit {
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  clientes: any[] = [];
  cargando = true;
  errorMsg: string | null = null;
  searchText = '';

  mostrarFormulario = false;
  editando = false;

  // Paginación
  pagina = 0;
  filasPorPagina = 10;

  nuevoCliente = {
    id: 0,
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true,
  };

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.cargando = true;
    this.errorMsg = null;
    this.clienteService.getAll().subscribe({
      next: (data: any) => {
        this.clientes = Array.isArray(data) ? data : [];
        this.cargando = false;
      },
      error: (err) => {
        this.errorMsg = 'Error al cargar clientes';
        this.cargando = false;
      },
    });
  }

  get clientesVista() {
    const t = this.searchText.trim().toLowerCase();
    let list = this.clientes.filter((c) => {
      if (!t) return true;
      return (
        (c.nombre || '').toLowerCase().includes(t) ||
        (c.documento || '').toLowerCase().includes(t) ||
        (c.email || '').toLowerCase().includes(t) ||
        (c.telefono || '').toLowerCase().includes(t)
      );
    });
    return list;
  }

  get totalFiltrados() {
    return this.clientesVista.length;
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.filasPorPagina));
  }

  get clientesPagina() {
    const start = this.pagina * this.filasPorPagina;
    return this.clientesVista.slice(start, start + this.filasPorPagina);
  }

  get paginaReporte() {
    const n = this.totalFiltrados;
    if (n === 0) return '0 clientes';
    const first = this.pagina * this.filasPorPagina + 1;
    const last = Math.min(n, (this.pagina + 1) * this.filasPorPagina);
    return `Mostrando ${first} a ${last} de ${n} clientes`;
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

  abrirCrear() {
    this.resetFormulario();
    this.editando = false;
    this.mostrarFormulario = true;
  }

  abrirEditar(c: any) {
    this.nuevoCliente = {
      id: c.id,
      nombre: c.nombre,
      documento: c.documento || '',
      email: c.email || '',
      telefono: c.telefono || '',
      direccion: c.direccion || '',
      activo: c.activo !== false,
    };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.resetFormulario();
  }

  resetFormulario() {
    this.nuevoCliente = {
      id: 0,
      nombre: '',
      documento: '',
      email: '',
      telefono: '',
      direccion: '',
      activo: true,
    };
  }

  guardarCliente() {
  if (!this.nuevoCliente.nombre.trim()) return;

  const data = {
    nombre: this.nuevoCliente.nombre.trim(),
    documento: this.nuevoCliente.documento.trim() || undefined,
    email: this.nuevoCliente.email.trim() || undefined,
    telefono: this.nuevoCliente.telefono.trim() || undefined,
    direccion: this.nuevoCliente.direccion.trim() || undefined,
    activo: this.nuevoCliente.activo,
  };

  if (this.editando) {
    this.clienteService.update(this.nuevoCliente.id, data).subscribe({
      next: () => {
        this.cargarClientes();
        this.cerrarFormulario();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado correctamente' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar' });
      },
    });
  } else {
    this.clienteService.create(data).subscribe({
      next: () => {
        this.cargarClientes();
        this.cerrarFormulario();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado correctamente' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear' });
      },
    });
  }
}

  eliminarCliente(id: number) {
  if (confirm('¿Eliminar este cliente?')) {
    this.clienteService.delete(id).subscribe({
      next: () => {
        this.cargarClientes();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
      },
    });
  }
}

  onActivoChange(activo: boolean, c: any) {
    const data = {
      nombre: c.nombre,
      documento: c.documento,
      email: c.email,
      telefono: c.telefono,
      direccion: c.direccion,
      activo: activo,
    };
    this.clienteService.update(c.id, data).subscribe({
      next: () => this.cargarClientes(),
      error: (err) => console.error('Error al cambiar estado', err),
    });
  }
}