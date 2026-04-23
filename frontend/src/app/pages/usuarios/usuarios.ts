import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

import {
  UsuarioService,
  type UsuarioMiembro,
} from '../../services/usuario.service';
import { AuthService } from '../../auth/auth.service';

const ROLES = [
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Usuario', value: 'Usuario' },
  { label: 'Operador', value: 'Operador' },
] as const;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TableModule,
    ToggleSwitchModule,
    TooltipModule,
    SelectModule,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);

  protected readonly roles = [...ROLES];

  cargando = true;
  errorMsg: string | null = null;
  filas: UsuarioMiembro[] = [];
  searchText = '';

  dialogoVisible = false;
  editando = false;
  guardando = false;

  form: {
    id: number;
    name: string;
    email: string;
    password: string;
    rol: string;
    activo: boolean;
  } = {
    id: 0,
    name: '',
    email: '',
    password: '',
    rol: 'Administrador',
    activo: true,
  };

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.errorMsg = null;
    this.usuarioService
      .getAll()
      .pipe(
        catchError((e) => {
          this.errorMsg =
            e?.error?.message ||
            (e?.status
              ? `Error ${e.status} al cargar usuarios`
              : 'No se pudo cargar la lista.');
          return of([] as UsuarioMiembro[]);
        }),
      )
      .subscribe((data) => {
        this.filas = data;
        this.cargando = false;
      });
  }

  get usuariosVista(): UsuarioMiembro[] {
    const t = this.searchText.trim().toLowerCase();
    if (!t) {
      return this.filas;
    }
    return this.filas.filter(
      (u) =>
        u.name.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        u.rol.toLowerCase().includes(t),
    );
  }

  abrirCrear() {
    this.editando = false;
    this.form = {
      id: 0,
      name: '',
      email: '',
      password: '',
      rol: 'Administrador',
      activo: true,
    };
    this.dialogoVisible = true;
  }

  abrirEditar(u: UsuarioMiembro) {
    this.editando = true;
    this.form = {
      id: u.id,
      name: u.name,
      email: u.email,
      password: '',
      rol: u.rol || 'Administrador',
      activo: u.activo,
    };
    this.dialogoVisible = true;
  }

  cerrarDialogo() {
    this.dialogoVisible = false;
  }

  guardar() {
    const f = this.form;
    if (!f.name.trim() || !f.email.trim()) {
      this.errorMsg = 'Complete nombre y email.';
      return;
    }
    this.guardando = true;
    this.errorMsg = null;

    if (this.editando) {
      const body: {
        name: string;
        email: string;
        rol: string;
        activo: boolean;
        password?: string;
      } = {
        name: f.name.trim(),
        email: f.email.trim().toLowerCase(),
        rol: f.rol,
        activo: f.activo,
      };
      if (f.password.trim().length >= 6) {
        body.password = f.password;
      }
      this.usuarioService.update(f.id, body).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarDialogo();
          this.cargar();
        },
        error: (e) => {
          this.guardando = false;
          this.exponerError(e, 'No se pudo actualizar el usuario.');
        },
      });
    } else {
      if (f.password.trim().length < 6) {
        this.guardando = false;
        this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }
      this.usuarioService
        .create({
          name: f.name.trim(),
          email: f.email.trim().toLowerCase(),
          password: f.password,
          rol: f.rol,
          activo: f.activo,
        })
        .subscribe({
          next: () => {
            this.guardando = false;
            this.cerrarDialogo();
            this.cargar();
          },
          error: (e) => {
            this.guardando = false;
            this.exponerError(e, 'No se pudo crear el usuario.');
          },
        });
    }
  }

  private exponerError(e: unknown, fallback: string) {
    const m = (e as { error?: { message?: string } })?.error?.message;
    this.errorMsg = typeof m === 'string' && m ? m : fallback;
  }

  onCambioActivo(u: UsuarioMiembro, valor: boolean) {
    const session = this.auth.getProfile();
    if (session && u.id === session.id && !valor) {
      this.errorMsg = 'No puede desactivar su propia sesión.';
      this.filas = this.filas.map((f) =>
        f.id === u.id ? { ...f, activo: true } : f,
      );
      return;
    }
    this.usuarioService.update(u.id, { activo: valor }).subscribe({
      next: () => {
        u.activo = valor;
        this.errorMsg = null;
      },
      error: () => {
        u.activo = !valor;
        this.errorMsg = 'No se pudo actualizar el estado de la cuenta.';
      },
    });
  }

  eliminar(u: UsuarioMiembro) {
    const session = this.auth.getProfile();
    if (session && u.id === session.id) {
      this.errorMsg = 'No puede eliminar su propio usuario.';
      return;
    }
    if (
      !window.confirm(
        `¿Eliminar a ${u.name} (${u.email})? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    this.usuarioService.delete(u.id).subscribe({
      next: () => {
        this.cargar();
        this.errorMsg = null;
      },
      error: (e) =>
        this.exponerError(e, 'No se pudo eliminar el usuario.'),
    });
  }

  iniciales(nombre: string, email: string): string {
    const base = (nombre || email || '?').trim();
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (
        parts[0]![0] + parts[parts.length - 1]![0]
      ).toUpperCase();
    }
    if (base.length >= 2) {
      return base.slice(0, 2).toUpperCase();
    }
    return (base[0] || '?').toUpperCase();
  }

}
