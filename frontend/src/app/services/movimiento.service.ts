import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

export type MovimientoApi = {
  id: number;
  tipo: string;
  cantidad: number;
  precioCompra?: number | null;
  fecha: string;
  producto?: { id: number; nombre: string; stock?: number };
  usuario?: { id: number; name: string; email?: string };
};

export type MovimientoCompraCreate = {
  tipo: 'COMPRA';
  cantidad: number;
  precioCompra: number;
  producto: number;
  usuario: number;
};

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/movimiento`;

  getAll() {
    return this.http.get<MovimientoApi[]>(this.apiUrl);
  }

  createCompra(body: MovimientoCompraCreate) {
    return this.http.post(this.apiUrl, body);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
