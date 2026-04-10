import { Component, OnInit, inject } from '@angular/core';
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
import { AuthService } from '../../../core/services/auth.service';
import { TimesService } from '../../../core/services/times.service';
import { Time } from '../../../core/models/time.model';

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
    return Number.isInteger(Number(value)) ? null : { integer: true };
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

  isAdmin = false;
  allTeams: Time[] = [];

  private route = inject(ActivatedRoute);
  private jogoService = inject(JogoService);
  private authService = inject(AuthService);
  private timesService = inject(TimesService);

  get winnerReady(): MatchWinnerResult | null {
    return this.winnerState.status === 'ready' ? this.winnerState.data : null;
  }

  constructor() {
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
    this.isAdmin = this.authService.hasRoleFromToken('ADMIN') ?? false;
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    
    if (!idParam || isNaN(id) || id <= 0) {
      this.error = 'ID de jogo inválido';
      this.loading = false;
      return;
    }

    this.jogoId = id;
    this.loadData();
    if (this.isAdmin) {
      this.loadTeams();
    }
  }

  loadTeams(): void {
    this.timesService.getTimes().subscribe(teams => {
      this.allTeams = teams;
    });
  }

  loadData(): void {
    if (!this.jogoId) return;
    
    this.loading = true;
    forkJoin({
      jogo: this.jogoService.getJogoById(this.jogoId).pipe(catchError(() => of(null))),
      resultados: this.jogoService.getJogoResultados(this.jogoId).pipe(catchError(() => of([]))),
      winnerState: this.jogoService.getJogoWinner(this.jogoId).pipe(
        switchMap(winner => of({ status: 'ready', data: winner } as const)),
        catchError(() => of({ status: 'empty', message: 'Vencedor ainda não definido.' } as const))
      )
    }).subscribe(({ jogo, resultados, winnerState }) => {
      this.jogo = jogo;
      this.resultados = resultados;
      this.winnerState = winnerState as any;
      this.loading = false;
    });
  }

  onRegistrarResultado(): void {
    if (this.resultadoForm.invalid || !this.jogoId) return;

    this.registerState = { status: 'submitting' };
    const { timeId, pontos } = this.resultadoForm.getRawValue();

    this.jogoService.registrarResultadoConfronto(this.jogoId, { timeId: Number(timeId), pontos: Number(pontos) }).subscribe({
      next: () => {
        this.loadData();
        this.registerState = { status: 'success', message: 'Resultado registrado com sucesso.' };
        this.resultadoForm.reset();
      },
      error: () => {
        this.registerState = { status: 'error', message: 'Erro ao registrar resultado.' };
      }
    });
  }

  onDeleteResultado(timeId: number): void {
    if (!this.jogoId || !confirm('Deseja realmente remover este resultado?')) return;

    this.jogoService.deleteMatchResult(this.jogoId, timeId).subscribe({
      next: () => this.loadData(),
      error: () => alert('Erro ao remover resultado.')
    });
  }
}
