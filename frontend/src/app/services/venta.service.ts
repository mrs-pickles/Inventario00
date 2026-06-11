import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/venta`;

  getAll() {
    return this.http.get(this.apiUrl);
  }

  getHistorial(page: number = 1, limit: number = 10) {
    return this.http.get(`${this.apiUrl}/historial?page=${page}&limit=${limit}`);
  }

  getOne(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  anular(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/anular`, {});
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}