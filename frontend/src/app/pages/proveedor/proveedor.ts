import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

import { ProveedorService } from '../../services/proveedor.service';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-proveedor',
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
  templateUrl: './proveedor.html',
  styleUrl: './proveedor.css',
})
export class Proveedor implements OnInit {
  private proveedorService = inject(ProveedorService);
  private messageService = inject(MessageService);
  proveedores: any[] = [];
  cargando = true;
  errorMsg: string | null = null;
  searchText = '';

  mostrarFormulario = false;
  editando = false;

  pagina = 0;
  filasPorPagina = 10;

  nuevoProveedor = {
    id: 0,
    nombre: '',
    documento: '',
    telefono: '',
    direccion: '',
    email: '',
    contacto: '',
    activo: true,
  };

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.cargando = true;
    this.errorMsg = null;
    this.proveedorService.getAll().subscribe({
      next: (data: any) => {
        this.proveedores = Array.isArray(data) ? data : [];
        this.cargando = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar proveedores';
        this.cargando = false;
      },
    });
  }

  get proveedoresVista() {
    const t = this.searchText.trim().toLowerCase();
    let list = this.proveedores.filter((p) => {
      if (!t) return true;
      return (
        (p.nombre || '').toLowerCase().includes(t) ||
        (p.documento || '').toLowerCase().includes(t) ||
        (p.telefono || '').toLowerCase().includes(t) ||
        (p.email || '').toLowerCase().includes(t) ||
        (p.contacto || '').toLowerCase().includes(t)
      );
    });
    return list;
  }

  get totalFiltrados() {
    return this.proveedoresVista.length;
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.filasPorPagina));
  }

  get proveedoresPagina() {
    const start = this.pagina * this.filasPorPagina;
    return this.proveedoresVista.slice(start, start + this.filasPorPagina);
  }

  get paginaReporte() {
    const n = this.totalFiltrados;
    if (n === 0) return '0 proveedores';
    const first = this.pagina * this.filasPorPagina + 1;
    const last = Math.min(n, (this.pagina + 1) * this.filasPorPagina);
    return `Mostrando ${first} a ${last} de ${n} proveedores`;
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

  abrirEditar(p: any) {
    this.nuevoProveedor = {
      id: p.id,
      nombre: p.nombre,
      documento: p.documento || '',
      telefono: p.telefono || '',
      direccion: p.direccion || '',
      email: p.email || '',
      contacto: p.contacto || '',
      activo: p.activo !== false,
    };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.resetFormulario();
  }

  resetFormulario() {
    this.nuevoProveedor = {
      id: 0,
      nombre: '',
      documento: '',
      telefono: '',
      direccion: '',
      email: '',
      contacto: '',
      activo: true,
    };
  }

  guardarProveedor() {
  if (!this.nuevoProveedor.nombre.trim()) return;

  const data = {
    nombre: this.nuevoProveedor.nombre.trim(),
    documento: this.nuevoProveedor.documento.trim() || undefined,
    telefono: this.nuevoProveedor.telefono.trim() || undefined,
    direccion: this.nuevoProveedor.direccion.trim() || undefined,
    email: this.nuevoProveedor.email.trim() || undefined,
    contacto: this.nuevoProveedor.contacto.trim() || undefined,
    activo: this.nuevoProveedor.activo,
  };

  if (this.editando) {
    this.proveedorService.update(this.nuevoProveedor.id, data).subscribe({
      next: () => {
        this.cargarProveedores();
        this.cerrarFormulario();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor actualizado correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar' });
      },
    });
  } else {
    this.proveedorService.create(data).subscribe({
      next: () => {
        this.cargarProveedores();
        this.cerrarFormulario();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor creado correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear' });
      },
    });
  }
}

  eliminarProveedor(id: number) {
  if (confirm('¿Eliminar este proveedor?')) {
    this.proveedorService.delete(id).subscribe({
      next: () => {
        this.cargarProveedores();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor eliminado correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
      },
    });
  }
}

  onActivoChange(activo: boolean, p: any) {
  const data = {
    nombre: p.nombre,
    documento: p.documento,
    telefono: p.telefono,
    direccion: p.direccion,
    email: p.email,
    contacto: p.contacto,
    activo: activo,
  };
  this.proveedorService.update(p.id, data).subscribe({
    next: () => {
      this.cargarProveedores();
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado del proveedor actualizado' });
    },
    error: () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cambiar estado' });
    },
  });
}
}