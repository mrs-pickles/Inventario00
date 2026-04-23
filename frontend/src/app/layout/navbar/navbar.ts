import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

const SECCION: Record<string, string> = {
  dashboard: 'Panel inicial',
  productos: 'Productos',
  catalogo: 'Catálogo',
  reporte: 'Reportes',
  categorias: 'Categorías',
  usuarios: 'Usuarios',
  movimientos: 'Movimientos',
};

function segmentoRuta(url: string): string {
  const s = url.split('?')[0] || '/';
  const p = s.replace(/^\/+/, '').split('/').filter(Boolean)[0];
  return p || 'dashboard';
}

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);

  protected seccion = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => SECCION[segmentoRuta(this.router.url)] ?? 'Inicio'),
    ),
    { initialValue: SECCION[segmentoRuta(this.router.url)] ?? 'Inicio' },
  );
}
