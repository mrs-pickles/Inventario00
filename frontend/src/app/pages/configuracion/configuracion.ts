import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { ConfiguracionService } from '../../services/configuracion.service';

@Component({
  selector: 'app-configuracion',
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
    ToggleSwitchModule,
    ToastModule,
    SelectModule,
  ],
  providers: [MessageService],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {
  private configService = inject(ConfiguracionService);
  private messageService = inject(MessageService);

  configs: any[] = [];
  cargando = true;
  errorMsg: string | null = null;
  searchText = '';

  mostrarFormulario = false;
  editando = false;

  nuevaConfig = {
    clave: '',
    valor: '',
    descripcion: '',
    tipo: 'string',
  };

  tipos = [
    { label: 'Texto', value: 'string' },
    { label: 'Número', value: 'number' },
    { label: 'Verdadero/Falso', value: 'boolean' },
    { label: 'JSON', value: 'json' },
  ];

  ngOnInit() {
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones() {
    this.cargando = true;
    this.configService.getAll().subscribe({
      next: (data: any) => {
        this.configs = Array.isArray(data) ? data : [];
        this.cargando = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar configuraciones';
        this.cargando = false;
      },
    });
  }

  get configsVista() {
    const t = this.searchText.trim().toLowerCase();
    let list = this.configs.filter((c) => {
      if (!t) return true;
      return (
        (c.clave || '').toLowerCase().includes(t) ||
        (c.descripcion || '').toLowerCase().includes(t)
      );
    });
    return list;
  }

  abrirCrear() {
    this.resetFormulario();
    this.editando = false;
    this.mostrarFormulario = true;
  }

  abrirEditar(c: any) {
    this.nuevaConfig = {
      clave: c.clave,
      valor: this.obtenerValorMostrar(c),
      descripcion: c.descripcion || '',
      tipo: c.tipo || 'string',
    };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  obtenerValorMostrar(c: any): string {
    if (c.tipo === 'json') {
      try {
        return JSON.stringify(JSON.parse(c.valor), null, 2);
      } catch {
        return c.valor;
      }
    }
    return c.valor;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.resetFormulario();
  }

  resetFormulario() {
    this.nuevaConfig = {
      clave: '',
      valor: '',
      descripcion: '',
      tipo: 'string',
    };
  }

  guardarConfiguracion() {
    if (!this.nuevaConfig.clave.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La clave es requerida' });
      return;
    }

    let valor: any = this.nuevaConfig.valor;
    
    if (this.nuevaConfig.tipo === 'number') {
      valor = Number(valor);
    } else if (this.nuevaConfig.tipo === 'boolean') {
      valor = valor === 'true' || valor === true;
    } else if (this.nuevaConfig.tipo === 'json') {
      try {
        valor = typeof valor === 'string' ? JSON.parse(valor) : valor;
      } catch {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'JSON inválido' });
        return;
      }
    }

    const data = {
      clave: this.nuevaConfig.clave.trim(),
      valor: valor,
      descripcion: this.nuevaConfig.descripcion,
      tipo: this.nuevaConfig.tipo,
    };

    if (this.editando) {
      this.configService.update(this.nuevaConfig.clave, data).subscribe({
        next: () => {
          this.cargarConfiguraciones();
          this.cerrarFormulario();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración actualizada' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar' });
        },
      });
    } else {
      this.configService.create(data).subscribe({
        next: () => {
          this.cargarConfiguraciones();
          this.cerrarFormulario();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración creada' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear' });
        },
      });
    }
  }

  eliminarConfiguracion(clave: string) {
    if (confirm(`¿Eliminar la configuración "${clave}"?`)) {
      this.configService.delete(clave).subscribe({
        next: () => {
          this.cargarConfiguraciones();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración eliminada' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
        },
      });
    }
  }

  getTipoBadge(tipo: string): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' | null | undefined {
    switch (tipo) {
      case 'string': return 'info';
      case 'number': return 'success';
      case 'boolean': return 'warn';
      case 'json': return 'secondary';
      default: return 'info';
    }
  }
}