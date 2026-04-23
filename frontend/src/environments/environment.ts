export const environment = {
  production: false,
  /**
   * Con `ng serve` use `proxy.conf.json`: /api -> http://localhost:3000
   * Misma ruta en Docker (Nginx -> api).
   */
  apiBase: '/api',
};
