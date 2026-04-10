import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Recompensa, RecompensasService } from '../../core/services/recompensas.service';

type TabKey = 'geral' | 'jogador' | 'jogo' | 'status';

type TabState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; items: Recompensa[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

type JogadorForm = FormGroup<{
  jogadorId: FormControl<number | null>;
}>;

type JogoForm = FormGroup<{
  jogoId: FormControl<number | null>;
}>;

type StatusForm = FormGroup<{
  status: FormControl<string | null>;
}>;

const integerValidator: ValidatorFn = (
  control: AbstractControl<number | null>
): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || Number.isNaN(value)) return { integer: true };
  return Number.isInteger(value) ? null : { integer: true };
};

const trimmedRequiredValidator: ValidatorFn = (
  control: AbstractControl<string | null>
): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined) return null;
  return value.trim().length > 0 ? null : { trimmedRequired: true };
};

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recompensas.component.html',
  styleUrls: ['./recompensas.component.scss']
})
export class RecompensasComponent {
  activeTab: TabKey = 'geral';

  stateByTab: Record<TabKey, TabState> = {
    geral: { status: 'idle' },
    jogador: { status: 'idle' },
    jogo: { status: 'idle' },
    status: { status: 'idle' }
  };

  jogadorForm: JogadorForm = new FormGroup({
    jogadorId: new FormControl<number | null>(null, {
      validators: [Validators.required, integerValidator, Validators.min(1)]
    })
  });

  jogoForm: JogoForm = new FormGroup({
    jogoId: new FormControl<number | null>(null, {
      validators: [Validators.required, integerValidator, Validators.min(1)]
    })
  });

  statusForm: StatusForm = new FormGroup({
    status: new FormControl<string | null>(null, {
      validators: [Validators.required, trimmedRequiredValidator]
    })
  });

  constructor(private recompensasService: RecompensasService) {}

  setTab(tab: TabKey): void {
    this.activeTab = tab;
  }

  onBuscarGeral(): void {
    this.stateByTab.geral = { status: 'loading' };
    this.recompensasService.getAll().subscribe({
      next: (items) => {
        const normalized = items ?? [];
        this.stateByTab.geral = normalized.length > 0 ? { status: 'ready', items: normalized } : { status: 'empty' };
      },
      error: (err: unknown) => {
        this.stateByTab.geral = { status: 'error', message: this.getErrorMessage(err, 'Falha ao carregar recompensas.') };
      }
    });
  }

  onBuscarPorJogador(): void {
    if (this.jogadorForm.invalid) {
      this.jogadorForm.markAllAsTouched();
      return;
    }

    const jogadorId = this.jogadorForm.getRawValue().jogadorId;
    if (jogadorId === null || !Number.isInteger(jogadorId) || jogadorId <= 0) {
      this.jogadorForm.markAllAsTouched();
      return;
    }

    this.stateByTab.jogador = { status: 'loading' };
    this.recompensasService.getByJogadorId(jogadorId).subscribe({
      next: (items) => {
        const normalized = items ?? [];
        this.stateByTab.jogador = normalized.length > 0 ? { status: 'ready', items: normalized } : { status: 'empty' };
      },
      error: (err: unknown) => {
        this.stateByTab.jogador = {
          status: 'error',
          message: this.getErrorMessage(err, 'Falha ao carregar recompensas do jogador.')
        };
      }
    });
  }

  onBuscarPorJogo(): void {
    if (this.jogoForm.invalid) {
      this.jogoForm.markAllAsTouched();
      return;
    }

    const jogoId = this.jogoForm.getRawValue().jogoId;
    if (jogoId === null || !Number.isInteger(jogoId) || jogoId <= 0) {
      this.jogoForm.markAllAsTouched();
      return;
    }

    this.stateByTab.jogo = { status: 'loading' };
    this.recompensasService.getByJogoId(jogoId).subscribe({
      next: (items) => {
        const normalized = items ?? [];
        this.stateByTab.jogo = normalized.length > 0 ? { status: 'ready', items: normalized } : { status: 'empty' };
      },
      error: (err: unknown) => {
        this.stateByTab.jogo = { status: 'error', message: this.getErrorMessage(err, 'Falha ao carregar recompensas do jogo.') };
      }
    });
  }

  onBuscarPorStatus(): void {
    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }

    const status = this.statusForm.getRawValue().status ?? '';
    const normalized = status.trim();
    if (normalized.length === 0) {
      this.statusForm.markAllAsTouched();
      return;
    }

    this.stateByTab.status = { status: 'loading' };
    this.recompensasService.getByStatus(normalized).subscribe({
      next: (items) => {
        const normalizedItems = items ?? [];
        this.stateByTab.status =
          normalizedItems.length > 0 ? { status: 'ready', items: normalizedItems } : { status: 'empty' };
      },
      error: (err: unknown) => {
        this.stateByTab.status = {
          status: 'error',
          message: this.getErrorMessage(err, 'Falha ao carregar recompensas por status.')
        };
      }
    });
  }

  onRetry(): void {
    switch (this.activeTab) {
      case 'geral':
        this.onBuscarGeral();
        return;
      case 'jogador':
        this.onBuscarPorJogador();
        return;
      case 'jogo':
        this.onBuscarPorJogo();
        return;
      case 'status':
        this.onBuscarPorStatus();
        return;
    }
  }

  get activeState(): TabState {
    return this.stateByTab[this.activeTab];
  }

  get activeItems(): Recompensa[] {
    return this.activeState.status === 'ready' ? this.activeState.items : [];
  }

  get jogadorIdCtrl(): FormControl<number | null> {
    return this.jogadorForm.controls.jogadorId;
  }

  get jogoIdCtrl(): FormControl<number | null> {
    return this.jogoForm.controls.jogoId;
  }

  get statusCtrl(): FormControl<string | null> {
    return this.statusForm.controls.status;
  }

  trackByRecompensaId(index: number, item: Recompensa): number {
    return item.id ?? index;
  }

  formatValorPago(valorPago: number): string {
    if (!Number.isFinite(valorPago)) return '0';
    return valorPago.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7
    });
  }

  getStatusLabel(status: string | null): string {
    const normalized = (status ?? '').trim();
    return normalized.length > 0 ? normalized : '—';
  }

  getStatusClass(status: string | null): 'pending' | 'confirmed' | 'failed' | 'neutral' {
    const normalized = (status ?? '').trim().toUpperCase();
    if (normalized === 'PENDENTE') return 'pending';
    if (normalized === 'CONFIRMADA') return 'confirmed';
    if (normalized === 'FALHA' || normalized === 'FALHOU' || normalized === 'FAILED') return 'failed';
    return 'neutral';
  }

  private getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 400) return 'Parâmetro inválido. Verifique o filtro e tente novamente.';
      if (err.status === 401) return 'Sessão expirada. Faça login novamente.';
      if (err.status === 404) return 'Nenhum resultado encontrado.';
    }
    return fallback;
  }
}
