import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';

export type VentasMesResp = {
  year: number;
  porMes: { mes: number; cantidad: number }[];
};

export type TopProducto = { nombre: string; cantidad: number };

export type EntradasSalidasResp = {
  year: number;
  entradas: number[];
  salidas: number[];
};

export type GananciasMesResp = {
  year: number;
  porMes: { mes: number; monto: number }[];
};

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/movimiento`;

  getVentasPorMes(year: number) {
    const params = new HttpParams().set('year', String(year));
    return this.http.get<VentasMesResp>(`${this.base}/estadisticas/ventas-mes`, {
      params,
    });
  }

  getEntradasSalidasMes(year: number) {
    const params = new HttpParams().set('year', String(year));
    return this.http.get<EntradasSalidasResp>(
      `${this.base}/estadisticas/entradas-salidas-mes`,
      { params },
    );
  }

  getGananciasMes(year: number) {
    const params = new HttpParams().set('year', String(year));
    return this.http.get<GananciasMesResp>(
      `${this.base}/estadisticas/ganancias-mes`,
      { params },
    );
  }

  getTopProductosVendidos(year: number, limit = 10) {
    const params = new HttpParams()
      .set('year', String(year))
      .set('limit', String(limit));
    return this.http.get<TopProducto[]>(
      `${this.base}/estadisticas/top-productos`,
      { params },
    );
  }
}
