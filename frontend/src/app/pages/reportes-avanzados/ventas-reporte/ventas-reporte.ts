import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';

import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ventas-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    
    TableModule,
    ChartModule,
    CardModule,
  ],
  templateUrl: './ventas-reporte.html',
  styleUrl: './ventas-reporte.css',
})
export class VentasReporte implements OnInit {
  private http = inject(HttpClient);

  cargando = false;
  data: any = null;
  
  fechaInicio?: Date;
  fechaFin?: Date;
  agrupacion: 'dia' | 'mes' | 'año' = 'mes';

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
        title: {
          display: true,
          text: 'Ventas por período',
        },
      },
    };
  }

  cargarReporte() {
    this.cargando = true;
    
    let url = `${environment.apiBase}/reportes-avanzados/ventas`;
    const params: string[] = [];
    
    if (this.fechaInicio) {
      params.push(`fechaInicio=${this.fechaInicio.toISOString().split('T')[0]}`);
    }
    if (this.fechaFin) {
      params.push(`fechaFin=${this.fechaFin.toISOString().split('T')[0]}`);
    }
    if (this.agrupacion) {
      params.push(`agrupacion=${this.agrupacion}`);
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
    if (this.data?.datosAgrupados) {
      this.chartData = {
        labels: this.data.datosAgrupados.map((d: any) => d.periodo),
        datasets: [
          {
            label: 'Ventas (Bs.)',
            data: this.data.datosAgrupados.map((d: any) => d.total),
            backgroundColor: 'rgba(61, 79, 62, 0.2)',
            borderColor: '#3d4f3e',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }
  }

  moneda(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
  }

  resetFiltros() {
    this.fechaInicio = undefined;
    this.fechaFin = undefined;
    this.agrupacion = 'mes';
    this.cargarReporte();
  }
}