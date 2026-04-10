import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { JogoService } from '../../../core/services/jogo.service';
import { Jogo, MatchResult, MatchWinnerResult } from '../../../core/models/jogo.model';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

type RegisterState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type ResultadoFormGroup = FormGroup<{
  timeId: FormControl<number | null>;
  pontos: FormControl<number | null>;
}>;

type WinnerState =
  | { status: 'loading' }
  | { status: 'empty'; message: string }
  | { status: 'ready'; data: MatchWinnerResult }
  | { status: 'error'; message: string };

const integerValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return Number.isInteger(value) ? null : { integer: true };
  };
};

@Component({
  selector: 'app-jogo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AlertComponent, SpinnerComponent],
  templateUrl: './jogo-detail.component.html',
  styleUrls: ['./jogo-detail.component.scss']
})
export class JogoDetailComponent implements OnInit {
  jogo: Jogo | null = null;
  resultados: MatchResult[] = [];
  loading = true;
  error: string | null = null;
  registerState: RegisterState = { status: 'idle' };
  winnerState: WinnerState = { status: 'loading' };
  resultadoForm: ResultadoFormGroup;
  private jogoId: number | null = null;

  get winnerReady(): MatchWinnerResult | null {
    return this.winnerState.status === 'ready' ? this.winnerState.data : null;
  }

  get winnerEmptyMessage(): string | null {
    return this.winnerState.status === 'empty' ? this.winnerState.message : null;
  }

  get winnerErrorMessage(): string | null {
    return this.winnerState.status === 'error' ? this.winnerState.message : null;
  }

  constructor(
    private route: ActivatedRoute,
    private jogoService: JogoService
  ) {
    this.resultadoForm = new FormGroup({
      timeId: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(1), integerValidator()]
      }),
      pontos: new FormControl<number | null>(null, {
        validators: [
          Validators.required,
          Validators.min(0),
          Validators.max(999),
          integerValidator()
        ]
      })
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    
    if (!idParam || isNaN(id) || id <= 0) {
      this.error = 'ID de jogo inválido';
      this.loading = false;
      return;
    }

    this.jogoId = id;
    this.registerState = { status: 'idle' };
    this.winnerState = { status: 'loading' };

    forkJoin({
      jogo: this.jogoService.getJogoById(id).pipe(
        catchError(err => {
          if (err.status === 404) {
            this.error = 'Jogo não encontrado';
          } else {
            this.error = 'Erro ao carregar o jogo';
          }
          console.error('Erro ao carregar jogo:', err);
          return of(null);
        })
      ),
      resultados: this.jogoService.getJogoResultados(id).pipe(
        catchError(err => {
          console.error('Erro ao carregar resultados:', err);
          return of([]);
        })
      ),
      winnerState: this.jogoService.getJogoWinner(id).pipe(
        switchMap((winner) => {
          if (winner.empate) {
            return of({ status: 'ready', data: winner } as const);
          }
          if (winner.vencedorTimeId === null) {
            return of({
              status: 'empty',
              message: 'Vencedor ainda não definido.'
            } as const);
          }
          return of({ status: 'ready', data: winner } as const);
        }),
        catchError(err => {
          if (err?.status === 404) {
            return of({
              status: 'empty',
              message: 'Vencedor ainda não definido.'
            } as const);
          }
          return of({
            status: 'error',
            message: 'Erro ao carregar o vencedor.'
          } as const);
        })
      )
    }).subscribe(({ jogo, resultados, winnerState }) => {
      this.jogo = jogo;
      this.resultados = resultados;
      this.winnerState = winnerState;
      this.loading = false;
    });
  }

  onRegistrarResultado(): void {
    if (this.jogoId === null) {
      this.registerState = { status: 'error', message: 'Jogo inválido.' };
      return;
    }

    if (this.resultadoForm.invalid) {
      this.resultadoForm.markAllAsTouched();
      return;
    }

    const { timeId, pontos } = this.resultadoForm.getRawValue();
    if (timeId === null || pontos === null) {
      this.registerState = {
        status: 'error',
        message: 'Preencha timeId e pontos.'
      };
      return;
    }

    this.registerState = { status: 'submitting' };

    this.jogoService
      .registrarResultadoConfronto(this.jogoId, { timeId, pontos })
      .pipe(
        switchMap(() =>
          forkJoin({
            resultados: this.jogoService.getJogoResultados(this.jogoId as number),
            winnerState: this.jogoService.getJogoWinner(this.jogoId as number).pipe(
              switchMap((winner) => {
                if (winner.empate) {
                  return of({ status: 'ready', data: winner } as const);
                }
                if (winner.vencedorTimeId === null) {
                  return of({
                    status: 'empty',
                    message: 'Vencedor ainda não definido.'
                  } as const);
                }
                return of({ status: 'ready', data: winner } as const);
              }),
              catchError(err => {
                if (err?.status === 404) {
                  return of({
                    status: 'empty',
                    message: 'Vencedor ainda não definido.'
                  } as const);
                }
                return of({
                  status: 'error',
                  message: 'Erro ao carregar o vencedor.'
                } as const);
              })
            )
          })
        )
      )
      .subscribe({
        next: ({ resultados, winnerState }) => {
          this.resultados = resultados;
          this.winnerState = winnerState;
          this.registerState = {
            status: 'success',
            message: 'Resultado registrado com sucesso.'
          };
          this.resultadoForm.reset({ timeId, pontos: null });
        },
        error: (err) => {
          const message =
            err?.status === 400
              ? 'Dados inválidos. Verifique timeId e pontos.'
              : err?.status === 401
                ? 'Sessão expirada. Faça login novamente.'
                : 'Não foi possível registrar o resultado. Tente novamente.';
          this.registerState = { status: 'error', message };
          console.error('Erro ao registrar resultado:', err);
        }
      });
  }
}
