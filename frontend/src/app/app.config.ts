import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { InventarioPreset } from './theme/inventario-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    providePrimeNG({
      theme: {
        preset: InventarioPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
