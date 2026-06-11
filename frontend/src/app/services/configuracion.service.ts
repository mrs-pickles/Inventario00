import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/configuracion`;

  getAll() {
    return this.http.get(this.apiUrl);
  }

  getByClave(clave: string) {
    return this.http.get(`${this.apiUrl}/${clave}`);
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  update(clave: string, data: any) {
    return this.http.put(`${this.apiUrl}/${clave}`, data);
  }

  delete(clave: string) {
    return this.http.delete(`${this.apiUrl}/${clave}`);
  }
}