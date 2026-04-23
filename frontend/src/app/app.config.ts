import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { InventarioPreset } from './theme/inventario-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),

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
