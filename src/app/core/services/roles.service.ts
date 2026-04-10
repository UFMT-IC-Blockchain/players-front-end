import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/role.model';

type RoleCheckResponse = {
  hasRole: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRoleCheckResponse(value: unknown): value is RoleCheckResponse {
  return isRecord(value) && typeof value['hasRole'] === 'boolean';
}

function normalizeRoleName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeRolesResponse(value: unknown): Role[] {
  const rolesFromArray = (arr: unknown[]): Role[] => {
    const roles: Role[] = [];
    for (const item of arr) {
      const fromString = normalizeRoleName(item);
      if (fromString) {
        roles.push({ nome: fromString });
        continue;
      }

      if (isRecord(item)) {
        const nome = normalizeRoleName(item['nome']) ?? normalizeRoleName(item['name']);
        if (!nome) {
          continue;
        }
        const id = typeof item['id'] === 'number' ? item['id'] : undefined;
        roles.push({ id, nome });
      }
    }
    return roles;
  };

  if (Array.isArray(value)) {
    return rolesFromArray(value);
  }

  if (isRecord(value) && Array.isArray(value['roles'])) {
    return rolesFromArray(value['roles']);
  }

  return [];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<unknown>(`${this.apiUrl}/roles`).pipe(map(normalizeRolesResponse));
  }

  checkRole(userId: number, roleName: string): Observable<boolean> {
    const encodedRoleName = encodeURIComponent(roleName);
    return this.http
      .get<unknown>(`${this.apiUrl}/roles/check/${userId}/${encodedRoleName}`)
      .pipe(map((value) => (isRoleCheckResponse(value) ? value.hasRole : false)));
  }
}
