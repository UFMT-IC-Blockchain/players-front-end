import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { JogoService } from '../../../core/services/jogo.service';
import { RolesService } from '../../../core/services/roles.service';
import { JogoComDetalhes, MatchResult } from '../../../core/models/jogo.model';
import { ListJogosComponent } from './list-jogos.component';
import { Role } from '../../../core/models/role.model';

type JasmineExpectation = {
  toBeTruthy: () => void;
  toEqual: (expected: unknown) => void;
  toBe: (expected: unknown) => void;
};

declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const afterEach: (fn: () => void | Promise<void>) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (actual: unknown) => JasmineExpectation;

describe('ListJogosComponent', () => {
  let jogos$: Observable<JogoComDetalhes[]>;
  let resultadosByJogoId: (jogoId: number) => Observable<MatchResult[]>;
  let getJogosCalls = 0;
  let getResultadosCalls = 0;
  let originalConsoleError: typeof console.error;

  let tokenRoleResult: boolean | null = true;
  let roles$: Observable<Role[]>;

  const authServiceMock: Pick<AuthService, 'hasRoleFromToken'> = {
    hasRoleFromToken: () => tokenRoleResult
  };

  const jogoServiceMock: Pick<JogoService, 'getJogos' | 'getJogoResultados'> = {
    getJogos: () => {
      getJogosCalls += 1;
      return jogos$;
    },
    getJogoResultados: (jogoId: number) => {
      getResultadosCalls += 1;
      return resultadosByJogoId(jogoId);
    }
  };

  const rolesServiceMock: Pick<RolesService, 'getRoles'> = {
    getRoles: () => roles$
  };

  beforeEach(async () => {
    jogos$ = of([]);
    resultadosByJogoId = () => of([]);
    roles$ = of([]);
    tokenRoleResult = true;
    getJogosCalls = 0;
    getResultadosCalls = 0;
    originalConsoleError = console.error;
    console.error = ((..._args: unknown[]) => {}) as typeof console.error;

    await TestBed.configureTestingModule({
      imports: [ListJogosComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: JogoService, useValue: jogoServiceMock },
        { provide: RolesService, useValue: rolesServiceMock }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(ListJogosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve renderizar estado de loading enquanto a lista de jogos não retorna', () => {
    const subject = new Subject<JogoComDetalhes[]>();
    jogos$ = subject.asObservable();

    const fixture = TestBed.createComponent(ListJogosComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Carregando jogos...')).toBe(true);
    expect(getJogosCalls).toBe(1);

    subject.complete();
  });

  it('deve renderizar estado vazio quando não há jogos e usuário pode criar jogo', () => {
    tokenRoleResult = true;
    jogos$ = of([]);

    const fixture = TestBed.createComponent(ListJogosComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Nenhum jogo encontrado')).toBe(true);
    expect(text.includes('Comece criando o primeiro jogo da temporada!')).toBe(true);
    expect(text.includes('Criar Jogo')).toBe(true);
  });

  it('deve renderizar estado de erro quando falha ao carregar jogos e permitir tentar novamente', () => {
    tokenRoleResult = true;
    jogos$ = throwError(() => new Error('falha'));

    const fixture = TestBed.createComponent(ListJogosComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Falha ao carregar a lista de jogos.')).toBe(true);
    expect(text.includes('Tentar novamente')).toBe(true);
    expect(getJogosCalls).toBe(1);

    jogos$ = of([]);
    const retryButton = (fixture.nativeElement as HTMLElement).querySelector(
      'app-alert button'
    ) as HTMLButtonElement | null;
    expect(Boolean(retryButton)).toBe(true);

    retryButton?.click();
    fixture.detectChanges();

    expect(getJogosCalls).toBe(2);
  });

  it('deve renderizar estado de erro de resultados quando falha ao buscar resultados do jogo', () => {
    tokenRoleResult = true;
    jogos$ = of([{ id: 1, duracao: 10 }]);
    resultadosByJogoId = () => throwError(() => new Error('falha resultados'));

    const fixture = TestBed.createComponent(ListJogosComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(getResultadosCalls).toBe(1);
    expect(text.includes('Falha ao carregar resultados.')).toBe(true);
    expect(text.includes('Recarregar')).toBe(true);
  });

  it('deve renderizar erro de permissão no admin gate quando RolesService falha com 403', () => {
    tokenRoleResult = null;
    jogos$ = of([]);
    roles$ = throwError(
      () => new HttpErrorResponse({ status: 403, statusText: 'Forbidden', url: '/roles' })
    );

    const fixture = TestBed.createComponent(ListJogosComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Sem permissão para criar jogos.')).toBe(true);
  });
});
