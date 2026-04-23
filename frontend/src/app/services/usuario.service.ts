import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

export type UsuarioMiembro = {
  id: number;
  name: string;
  email: string;
  rol: string;
  activo: boolean;
};

export type UsuarioCrear = {
  name: string;
  email: string;
  password: string;
  rol?: string;
  activo?: boolean;
};

export type UsuarioActualizar = {
  name?: string;
  email?: string;
  password?: string;
  rol?: string;
  activo?: boolean;
};

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/usuario`;

  getAll() {
    return this.http.get<UsuarioMiembro[]>(this.apiUrl);
  }

  create(data: UsuarioCrear) {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: UsuarioActualizar) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
