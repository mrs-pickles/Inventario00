import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-stock-reporte',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    ProgressBarModule,
  ],
  templateUrl: './stock-reporte.html',
  styleUrl: './stock-reporte.css',
})
export class StockReporte implements OnInit {
  private http = inject(HttpClient);

  cargando = false;
  productos: any[] = [];
  limite = 20;

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.cargando = true;
    const url = `${environment.apiBase}/reportes-avanzados/stock-bajo?limite=${this.limite}`;

    this.http.get(url).subscribe({
      next: (res: any) => {
        this.productos = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  getPorcentajeStock(stock: number, stockMinimo: number): number {
    if (stockMinimo === 0) return 100;
    const porcentaje = (stock / stockMinimo) * 100;
    return Math.min(100, Math.max(0, porcentaje));
  }

  getSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (estado) {
      case 'AGOTADO': return 'danger';
      case 'BAJO': return 'warn';
      default: return 'info';
    }
  }

  exportarCSV() {
    if (this.productos.length === 0) return;

    const headers = ['Producto', 'Categoría', 'Stock actual', 'Stock mínimo', 'Estado'];
    const rows = this.productos.map(p => [
      p.nombre,
      p.categoria,
      p.stock,
      p.stockMinimo,
      p.estado
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'stock_bajo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}