import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiBase}/producto`;

  getAll() {
    return this.http.get(this.apiUrl);
  }

  getConteoPorCategoria() {
    return this.http.get<{ categoria: string; total: number }[]>(
      `${this.apiUrl}/estadisticas/por-categoria`,
    );
  }

  getResumenInventario() {
    return this.http.get<{
      totalProductos: number;
      productosAgotados: number;
      devoluciones: number;
      pedidosEnCamino: number;
      valorInventarioBs: number;
    }>(`${this.apiUrl}/estadisticas/resumen`);
  }

  getInformeExistencias() {
    return this.http.get<{
      existenciasTotalBs: number;
      filas: {
        id: number;
        nombre: string;
        sku: string;
        categoria: string;
        cantidad: number;
        valor: number;
      }[];
    }>(`${this.apiUrl}/reporte/existencias`);
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}