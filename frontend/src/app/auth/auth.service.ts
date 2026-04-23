import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const USER_KEY = 'currentUser';

export type SessionUser = {
  id: number;
  name: string;
  email: string;
};

export type ProfileView = SessionUser & { initials: string };

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiBase}/auth`;

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  saveToken(token: string, persistent: boolean) {
    if (persistent) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
  }

  saveCurrentUser(user: SessionUser, persistent: boolean) {
    const raw = JSON.stringify(user);
    if (persistent) {
      localStorage.setItem(USER_KEY, raw);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, raw);
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Tras login: quita restos viejos y aplica dónde guarda según «Mantener la sesión».
   */
  persistAfterLogin(
    accessToken: string,
    user: SessionUser | undefined,
    keepOpen: boolean
  ) {
    this.logout();
    this.saveToken(accessToken, keepOpen);
    if (user) {
      this.saveCurrentUser(user, keepOpen);
    }
  }

  getToken() {
    // localStorage = sesión persistente; sessionStorage = solo en esta ventana
    return (
      localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? null
    );
  }

  /** Datos del perfil para la UI (localStorage o payload del JWT). */
  getProfile(): ProfileView | null {
    const raw =
      localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    if (raw) {
      try {
        const u = JSON.parse(raw) as SessionUser;
        if (u?.email) {
          const displayName = this.nameForDisplay(
            u.name || u.email.split('@')[0] || 'Usuario',
          );
          return { ...u, name: displayName, initials: this.initialsFromName(displayName) };
        }
      } catch {
        /* ignore */
      }
    }
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = this.decodeJwtPayload(token);
    if (!payload?.email) {
      return null;
    }
    const displayName = this.nameForDisplay(
      payload.name || payload.email.split('@')[0] || 'Usuario',
    );
    return {
      id: Number(payload.sub) || 0,
      name: displayName,
      email: payload.email,
      initials: this.initialsFromName(displayName),
    };
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem(USER_KEY);
  }

  /** Tipo título: primera letra de cada palabra en mayúscula (español). */
  private nameForDisplay(name: string): string {
    if (!name?.trim()) {
      return name?.trim() ?? '';
    }
    return name
      .trim()
      .split(/\s+/)
      .map((word) => {
        if (!word) {
          return word;
        }
        const lower = word.toLocaleLowerCase('es');
        return lower.charAt(0).toLocaleUpperCase('es') + lower.slice(1);
      })
      .join(' ');
  }

  private initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    const n = parts[0]?.[0];
    return n ? n.toUpperCase() : '?';
  }

  private decodeJwtPayload(
    token: string,
  ): { sub?: number; name?: string; email?: string } | null {
    try {
      const part = token.split('.')[1];
      if (!part) {
        return null;
      }
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = decodeURIComponent(
        [...atob(padded)]
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
