import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Tema verde suave: acentos en escala `green` de Aura y superficies más claras.
 */
export const InventarioPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{green.50}',
      100: '{green.100}',
      200: '{green.200}',
      300: '{green.300}',
      400: '{green.400}',
      500: '{green.600}',
      600: '{green.700}',
      700: '{green.800}',
      800: '{green.900}',
      900: '{green.950}',
      950: '#022c14',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f4faf6',
          100: '#e8f5ec',
          200: '#d4eadc',
          300: '#b9dcc6',
          400: '#8eb89e',
          500: '#6a937c',
          600: '#4f7560',
          700: '#3f5e4d',
          800: '#2f4a3a',
          900: '#1f3328',
          950: '#101a16',
        },
        formField: {
          shadow: '0 1px 2px rgba(22, 101, 52, 0.04)',
        },
      },
    },
  },
});
