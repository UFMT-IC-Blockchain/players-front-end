import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { login: string; senha?: string }): Observable<LoginResponse> {
    // We assume the backend route will be /usuario/login or /auth/login based on current implementation
    // For now we use /usuario since that controller exists, or we can use /login.
    // Given backend structure, it seems the method validaLogin is inside usuario.service
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}
