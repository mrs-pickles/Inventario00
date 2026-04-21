import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './auth/login/login';
import { Categorias } from './pages/categorias/categorias';
import { Productos } from './pages/productos/productos';
import { Movimientos } from './pages/movimientos/movimientos';
import { Usuarios } from './pages/usuarios/usuarios';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },

  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'categorias',
        component: Categorias
      },
      {
        path: 'productos',
        component: Productos
      },
      {
        path: 'movimientos',
        component: Movimientos
      },
      {
        path: 'usuarios',
        component: Usuarios
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];