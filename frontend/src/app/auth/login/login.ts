import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  /** Solo si el usuario marca la casilla: guardar en localStorage (cierre de navegador: sigue la sesión). */
  staySignedIn = false;

  ngOnInit() {
    // Al entrar a /login, siempre sin marcar (evita estado previo o restauración del navegador).
    this.staySignedIn = false;
  }

  iniciarSesion() {
    const email = this.email?.trim() ?? '';
    const password = this.password ?? '';

    this.authService.login({
      email,
      password
    }).subscribe({
      next: (res: any) => {
        const keepOpen = this.staySignedIn === true;
        this.authService.persistAfterLogin(
          res.access_token,
          res.usuario,
          keepOpen
        );

        alert('Inicio de sesión correcto');

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 401) {
          alert('Correo o contraseña incorrectos');
        } else if (status === 400) {
          alert('Datos inválidos. Revise el formato del correo y que la contraseña no esté vacía.');
        } else {
          alert(
            `No se pudo iniciar sesión${status ? ` (error ${status})` : ''}. Compruebe que el backend esté en ejecución.`
          );
        }
      }
    });
  }
}