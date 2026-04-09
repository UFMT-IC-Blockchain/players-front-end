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
import { Jogo, MatchResult } from '../../../core/models/jogo.model';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

type RegisterState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type ResultadoFormGroup = FormGroup<{
  timeId: FormControl<number | null>;
  pontos: FormControl<number | null>;
}>;

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
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './jogo-detail.component.html',
  styleUrls: ['./jogo-detail.component.scss']
})
export class JogoDetailComponent implements OnInit {
  jogo: Jogo | null = null;
  resultados: MatchResult[] = [];
  loading = true;
  error: string | null = null;
  registerState: RegisterState = { status: 'idle' };
  resultadoForm: ResultadoFormGroup;
  private jogoId: number | null = null;

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
      )
    }).subscribe(({ jogo, resultados }) => {
      this.jogo = jogo;
      this.resultados = resultados;
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
      .pipe(switchMap(() => this.jogoService.getJogoResultados(this.jogoId as number)))
      .subscribe({
        next: (resultadosAtualizados) => {
          this.resultados = resultadosAtualizados;
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
