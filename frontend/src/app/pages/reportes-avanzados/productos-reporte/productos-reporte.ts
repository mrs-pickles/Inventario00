import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-productos-reporte',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    ProgressBarModule,
  ],
  templateUrl: './productos-reporte.html',
  styleUrl: './productos-reporte.css',
})
export class ProductosReporte implements OnInit {
  private http = inject(HttpClient);

  cargando = false;
  productos: any[] = [];
  limite = 10;

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.cargando = true;
    const url = `${environment.apiBase}/reportes-avanzados/productos-mas-vendidos?limite=${this.limite}`;

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

  cambiarLimite(limite: number) {
    this.limite = limite;
    this.cargarReporte();
  }

  moneda(n: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
  }

  getMaxVendido(): number {
    if (this.productos.length === 0) return 1;
    return Math.max(...this.productos.map(p => p.totalVendido));
  }

  getPorcentaje(vendido: number): number {
    return (vendido / this.getMaxVendido()) * 100;
  }
}