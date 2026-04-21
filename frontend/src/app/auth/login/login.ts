import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  iniciarSesion() {
    const email = this.email?.trim() ?? '';
    const password = this.password ?? '';

    this.authService.login({
      email,
      password
    }).subscribe({
      next: (res: any) => {

        this.authService.saveToken(res.access_token);
        if (res.usuario) {
          this.authService.saveCurrentUser(res.usuario);
        }

        alert('Login correcto');

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