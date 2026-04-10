import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../../core/services/roles.service';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-minhas-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minhas-roles.component.html',
  styleUrls: ['./minhas-roles.component.scss']
})
export class MinhasRolesComponent implements OnInit {
  status: 'loading' | 'error' | 'empty' | 'ready' = 'loading';
  errorMessage = '';
  roles: Role[] = [];

  constructor(private rolesService: RolesService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.status = 'loading';
    this.errorMessage = '';
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data ?? [];
        this.status = this.roles.length > 0 ? 'ready' : 'empty';
      },
      error: (err: unknown) => {
        this.status = 'error';
        this.errorMessage = this.getFriendlyErrorMessage(err);
      }
    });
  }

  isAdmin(role: Role): boolean {
    return role.nome.trim().toUpperCase() === 'ADMIN';
  }

  trackByRole(index: number, role: Role): number | string {
    return role.id ?? role.nome ?? index;
  }

  private getFriendlyErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 403) {
        return 'Sem permissão para visualizar suas roles.';
      }
      if (err.status === 401) {
        return 'Sua sessão expirou. Faça login novamente.';
      }
    }
    return 'Falha ao carregar suas roles.';
  }
}
