import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JogoService } from '../../../core/services/jogo.service';
import { JogoComDetalhes } from '../../../core/models/jogo.model';
import { RolesService } from '../../../core/services/roles.service';

type ResultadosState = {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  message?: string;
};

@Component({
  selector: 'app-list-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-jogos.component.html',
  styleUrls: ['./list-jogos.component.scss']
})
export class ListJogosComponent implements OnInit {
  jogos: JogoComDetalhes[] = [];
  resultadosStateByJogoId = new Map<number, ResultadosState>();
  isLoading = true;
  errorMessage = '';

  adminGateStatus: 'loading' | 'ready' | 'error' = 'loading';
  adminGateErrorMessage = '';
  canCreateJogo = false;

  constructor(
    private authService: AuthService,
    private jogoService: JogoService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.loadAdminGate();
    this.loadJogos();
  }

  loadAdminGate(): void {
    this.adminGateStatus = 'loading';
    this.adminGateErrorMessage = '';

    const tokenHasAdmin = this.authService.hasRoleFromToken('ADMIN');
    if (tokenHasAdmin !== null) {
      this.canCreateJogo = tokenHasAdmin;
      this.adminGateStatus = 'ready';
      return;
    }

    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.canCreateJogo = (roles ?? []).some((role) => role.nome.trim().toUpperCase() === 'ADMIN');
        this.adminGateStatus = 'ready';
      },
      error: (err: unknown) => {
        this.canCreateJogo = false;
        this.adminGateStatus = 'error';
        this.adminGateErrorMessage = this.getFriendlyAdminGateErrorMessage(err);
      }
    });
  }

  loadJogos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.jogoService.getJogos().subscribe({
      next: (jogosData) => {
        this.jogos = [...jogosData].sort((a, b) => b.id - a.id);
        this.jogos.forEach((jogo) => this.loadResultadosForJogo(jogo));
        this.isLoading = false;
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage = 'Falha ao carregar a lista de jogos.';
        console.error('Erro ao buscar jogos', err);
      }
    });
  }

  loadResultadosForJogo(jogo: JogoComDetalhes): void {
    this.resultadosStateByJogoId.set(jogo.id, { status: 'loading' });
    jogo.resultados = undefined;

    this.jogoService.getJogoResultados(jogo.id).subscribe({
      next: (resultados) => {
        jogo.resultados = resultados;
        this.resultadosStateByJogoId.set(jogo.id, { status: 'loaded' });
      },
      error: (err: unknown) => {
        jogo.resultados = [];
        this.resultadosStateByJogoId.set(jogo.id, {
          status: 'error',
          message: 'Falha ao carregar resultados.'
        });
        console.error(`Erro ao carregar resultados para o jogo ${jogo.id}`, err);
      }
    });
  }

  trackByJogoId(index: number, jogo: JogoComDetalhes): number {
    return jogo.id ?? index;
  }

  private getFriendlyAdminGateErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) {
        return 'Sua sessão expirou. Faça login novamente.';
      }
      if (err.status === 403) {
        return 'Sem permissão para criar jogos.';
      }
    }
    return 'Não foi possível verificar permissão de ADMIN.';
  }
}
