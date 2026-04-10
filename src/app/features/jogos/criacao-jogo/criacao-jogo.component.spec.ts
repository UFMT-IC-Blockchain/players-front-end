import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { JogoService } from '../../../core/services/jogo.service';
import { Jogo } from '../../../core/models/jogo.model';
import { CriacaoJogoComponent } from './criacao-jogo.component';

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

describe('CriacaoJogoComponent', () => {
  let criarResponse$: Observable<Jogo>;
  let criarCalls = 0;
  let lastPayload: unknown = null;
  let navigations: unknown[] = [];
  let originalConsoleError: typeof console.error;

  const jogoServiceMock: Pick<JogoService, 'criarJogo'> = {
    criarJogo: (payload: { duracao: number }) => {
      criarCalls += 1;
      lastPayload = payload;
      return criarResponse$;
    }
  };

  beforeEach(async () => {
    criarResponse$ = of({ id: 10, duracao: 90 });
    criarCalls = 0;
    lastPayload = null;
    navigations = [];
    originalConsoleError = console.error;
    console.error = ((..._args: unknown[]) => {}) as typeof console.error;

    await TestBed.configureTestingModule({
      imports: [CriacaoJogoComponent],
      providers: [provideRouter([]), { provide: JogoService, useValue: jogoServiceMock }]
    }).compileComponents();

    const router = TestBed.inject(Router);
    router.navigate = ((commands: unknown[]) => {
      navigations.push(commands);
      return Promise.resolve(true);
    }) as unknown as Router['navigate'];
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(CriacaoJogoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('não deve submeter quando inválido e deve mostrar erro required', () => {
    const fixture = TestBed.createComponent(CriacaoJogoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    expect(criarCalls).toBe(0);
    expect(lastPayload).toBe(null);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('A duração é obrigatória.')).toBe(true);
  });

  it('não deve submeter quando duracao é menor que 1 e deve mostrar erro min', () => {
    const fixture = TestBed.createComponent(CriacaoJogoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.jogoForm.get('duracao')?.setValue(0);
    component.onSubmit();
    fixture.detectChanges();

    expect(criarCalls).toBe(0);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Duração mínima de 1 minuto.')).toBe(true);
  });

  it('deve criar jogo e navegar para /jogos/:id quando válido', () => {
    criarResponse$ = of({ id: 123, duracao: 90 });

    const fixture = TestBed.createComponent(CriacaoJogoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.jogoForm.get('duracao')?.setValue(90);
    component.onSubmit();
    fixture.detectChanges();

    expect(criarCalls).toBe(1);
    expect(lastPayload).toEqual({ duracao: 90 });
    expect(navigations.length).toBe(1);
    expect(navigations[0]).toEqual(['/jogos', 123]);
  });

  it('deve exibir mensagem de erro quando API falha', () => {
    criarResponse$ = throwError(() => new Error('falha'));

    const fixture = TestBed.createComponent(CriacaoJogoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.jogoForm.get('duracao')?.setValue(90);
    component.onSubmit();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Erro ao criar jogo. Por favor, tente novamente.');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Erro ao criar jogo. Por favor, tente novamente.')).toBe(true);
  });
});
