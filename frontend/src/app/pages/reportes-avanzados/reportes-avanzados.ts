import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VentasReporte } from './ventas-reporte/ventas-reporte';
import { ProductosReporte } from './productos-reporte/productos-reporte';
import { GananciasReporte } from './ganancias-reporte/ganancias-reporte';
import { StockReporte } from './stock-reporte/stock-reporte';
import { MovimientosReporte } from './movimientos-reporte/movimientos-reporte';

@Component({
  selector: 'app-reportes-avanzados',
  standalone: true,
  imports: [
    CommonModule,
    VentasReporte,
    ProductosReporte,
    GananciasReporte,
    StockReporte,
    MovimientosReporte,
  ],
  templateUrl: './reportes-avanzados.html',
  styleUrl: './reportes-avanzados.css',
})
export class ReportesAvanzados {
  activeTab = 0;
}