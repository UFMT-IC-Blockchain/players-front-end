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
import { RouterModule } from '@angular/router';
import { EstatisticasService, TopScorer } from '../../../core/services/estatisticas.service';

type TopScorersState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; items: TopScorer[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

type TopScorersForm = FormGroup<{
  limit: FormControl<number | null>;
}>;

const integerValidator: ValidatorFn = (
  control: AbstractControl<number | null>
): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || Number.isNaN(value)) return { integer: true };
  return Number.isInteger(value) ? null : { integer: true };
};

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './top-scorers.component.html',
  styleUrls: ['./top-scorers.component.scss']
})
export class TopScorersComponent {
  state: TopScorersState = { status: 'idle' };

  form: TopScorersForm = new FormGroup({
    limit: new FormControl<number | null>(10, {
      validators: [Validators.required, integerValidator, Validators.min(1), Validators.max(100)]
    })
  });

  get limitCtrl(): FormControl<number | null> {
    return this.form.controls.limit;
  }

  constructor(private estatisticasService: EstatisticasService) {}

  onCarregar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.state = { status: 'idle' };
      return;
    }

    const limit = this.form.getRawValue().limit;
    if (limit === null || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      this.form.markAllAsTouched();
      this.state = { status: 'idle' };
      return;
    }

    this.state = { status: 'loading' };
    this.estatisticasService.getTopScorers(limit).subscribe({
      next: (items) => {
        const normalized = items ?? [];
        this.state = normalized.length > 0 ? { status: 'ready', items: normalized } : { status: 'empty' };
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 400) {
            this.state = { status: 'error', message: 'Limite inválido. Use um inteiro entre 1 e 100.' };
            return;
          }
          if (err.status === 401) {
            this.state = { status: 'error', message: 'Sessão expirada. Faça login novamente.' };
            return;
          }
        }
        this.state = { status: 'error', message: 'Falha ao carregar top scorers.' };
      }
    });
  }

  trackByJogadorId(index: number, item: TopScorer): number {
    return item.jogadorId ?? index;
  }

  get readyItems(): TopScorer[] {
    return this.state.status === 'ready' ? this.state.items : [];
  }

  get errorMessage(): string | null {
    return this.state.status === 'error' ? this.state.message : null;
  }
}
