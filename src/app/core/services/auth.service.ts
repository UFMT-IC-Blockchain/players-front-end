import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { jwtDecode } from 'jwt-decode';

export interface LoginResponse {
  access_token: string;
}

export type UsuarioResponse = {
  id?: number | string;
  login?: string;
} & Record<string, unknown>;

type JwtTokenPayload = {
  exp?: number;
  roles?: unknown;
  role?: unknown;
} & Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeRoleName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

function extractRoleNamesFromToken(payload: JwtTokenPayload): string[] | null {
  const rolesValue = payload.roles ?? payload.role;

  const rolesFromArray = (arr: unknown[]): string[] => {
    const roles: string[] = [];
    for (const item of arr) {
      const fromString = normalizeRoleName(item);
      if (fromString) {
        roles.push(fromString);
        continue;
      }

      if (isRecord(item)) {
        const fromObj =
          normalizeRoleName(item['nome']) ??
          normalizeRoleName(item['name']) ??
          normalizeRoleName(item['role']);
        if (fromObj) {
          roles.push(fromObj);
        }
      }
    }
    return roles;
  };

  if (Array.isArray(rolesValue)) {
    return rolesFromArray(rolesValue);
  }

  if (typeof rolesValue === 'string') {
    const parts = rolesValue
      .split(',')
      .map((p) => normalizeRoleName(p))
      .filter((p): p is string => Boolean(p));
    return parts.length > 0 ? parts : null;
  }

  if (isRecord(rolesValue)) {
    const fromObj =
      normalizeRoleName(rolesValue['nome']) ??
      normalizeRoleName(rolesValue['name']) ??
      normalizeRoleName(rolesValue['role']);
    return fromObj ? [fromObj] : null;
  }

  return rolesValue === undefined ? null : [];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { login: string; senha: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  register(payload: { login: string; senha: string }): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/usuario`, payload);
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getDecodedToken(): JwtTokenPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtTokenPayload>(token);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded || typeof decoded.exp !== 'number') {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  }

  hasRoleFromToken(roleName: string): boolean | null {
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return null;
    }

    const roles = extractRoleNamesFromToken(decoded);
    if (roles === null) {
      return null;
    }

    const normalized = normalizeRoleName(roleName);
    if (!normalized) {
      return false;
    }

    return roles.includes(normalized);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}
