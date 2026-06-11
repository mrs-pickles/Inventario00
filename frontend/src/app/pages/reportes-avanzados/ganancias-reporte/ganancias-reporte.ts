import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ganancias-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    
    CardModule,
    ChartModule,
  ],
  templateUrl: './ganancias-reporte.html',
  styleUrl: './ganancias-reporte.css',
})
export class GananciasReporte implements OnInit {
  private http = inject(HttpClient);

  cargando = false;
  data: any = null;

  fechaInicio?: Date;
  fechaFin?: Date;

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.cargarReporte();
    this.initChartOptions();
  }

  initChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: Bs. ${this.moneda(value)}`;
            }
          }
        }
      },
    };
  }

  cargarReporte() {
    this.cargando = true;

    let url = `${environment.apiBase}/reportes-avanzados/ganancias`;
    const params: string[] = [];

    if (this.fechaInicio) {
      params.push(`fechaInicio=${this.fechaInicio.toISOString().split('T')[0]}`);
    }
    if (this.fechaFin) {
      params.push(`fechaFin=${this.fechaFin.toISOString().split('T')[0]}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get(url).subscribe({
      next: (res: any) => {
        this.data = res;
        this.actualizarGrafico();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  actualizarGrafico() {
    if (this.data) {
      this.chartData = {
        labels: ['Ventas', 'Costo', 'Ganancia'],
        datasets: [
          {
            data: [this.data.totalVentas, this.data.costoTotal, this.data.ganancia],
            backgroundColor: ['#3d4f3e', '#c4c0b8', '#4a3f36'],
            borderWidth: 0,
          },
        ],
      };
    }
  }

  resetFiltros() {
    this.fechaInicio = undefined;
    this.fechaFin = undefined;
    this.cargarReporte();
  }

  moneda(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
  }

  getMargenClass(): string {
    if (!this.data) return '';
    if (this.data.margen >= 30) return 'margen-alto';
    if (this.data.margen >= 15) return 'margen-medio';
    return 'margen-bajo';
  }
}