import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';

import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-movimientos-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    
    TableModule,
    CardModule,
    TagModule,
    SelectModule,
  ],
  templateUrl: './movimientos-reporte.html',
  styleUrl: './movimientos-reporte.css',
})
export class MovimientosReporte implements OnInit {
  private http = inject(HttpClient);

  cargando = false;
  data: any = null;

  fechaInicio?: Date;
  fechaFin?: Date;
  tipo: 'entrada' | 'salida' | null = null;

  tiposMovimiento = [
    { label: 'Todos', value: null },
    { label: 'Entradas', value: 'entrada' },
    { label: 'Salidas', value: 'salida' },
  ];

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.cargando = true;

    let url = `${environment.apiBase}/reportes-avanzados/movimientos`;
    const params: string[] = [];

    if (this.fechaInicio) {
      params.push(`fechaInicio=${this.fechaInicio.toISOString().split('T')[0]}`);
    }
    if (this.fechaFin) {
      params.push(`fechaFin=${this.fechaFin.toISOString().split('T')[0]}`);
    }
    if (this.tipo) {
      params.push(`tipo=${this.tipo}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get(url).subscribe({
      next: (res: any) => {
        this.data = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  resetFiltros() {
    this.fechaInicio = undefined;
    this.fechaFin = undefined;
    this.tipo = null;
    this.cargarReporte();
  }

  getTipoBadge(tipo: string): 'success' | 'danger' | 'info' {
    switch (tipo) {
      case 'entrada': return 'success';
      case 'salida': return 'danger';
      default: return 'info';
    }
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'entrada': return 'Entrada';
      case 'salida': return 'Salida';
      default: return tipo;
    }
  }

  fechaFormato(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-BO');
  }
}