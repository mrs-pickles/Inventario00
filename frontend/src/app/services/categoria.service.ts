import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

export type CategoriaListado = {
  id: number;
  nombre: string;
  cantidad: number;
};

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiBase}/categoria`;

  getAll() {
    return this.http.get(this.apiUrl);
  }

  /** Categorías con nº de productos (pantalla principal). */
  getListadoConConteo() {
    return this.http.get<CategoriaListado[]>(`${this.apiUrl}/listado`);
  }

  create(data: { nombre: string }) {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: { nombre: string }) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
