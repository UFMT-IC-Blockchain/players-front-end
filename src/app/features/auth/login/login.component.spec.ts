import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AuthService, LoginResponse } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

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

describe('LoginComponent', () => {
  let loginResponse$: Observable<LoginResponse>;
  let lastLoginPayload: unknown = null;
  let setTokenValue: string | null = null;
  let navigations: unknown[] = [];
  let originalConsoleError: typeof console.error;

  const authServiceMock: Pick<AuthService, 'login' | 'setToken'> = {
    login: (credentials: { login: string; senha: string }) => {
      lastLoginPayload = credentials;
      return loginResponse$;
    },
    setToken: (token: string) => {
      setTokenValue = token;
    }
  };

  beforeEach(async () => {
    loginResponse$ = of({ access_token: 'token' });
    lastLoginPayload = null;
    setTokenValue = null;
    navigations = [];
    originalConsoleError = console.error;
    console.error = ((..._args: unknown[]) => {}) as typeof console.error;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }]
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
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('não deve submeter quando inválido e deve mostrar erros do formulário', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.loginForm.setValue({ login: '', senha: '' });
    component.onSubmit();
    fixture.detectChanges();

    expect(lastLoginPayload).toBe(null);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Username is required.')).toBe(true);
    expect(text.includes('Password is required.')).toBe(true);
  });

  it('deve fazer login, salvar token e navegar para /jogos quando válido', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.loginForm.setValue({ login: 'user', senha: 'pass' });
    component.onSubmit();
    fixture.detectChanges();

    expect(lastLoginPayload).toEqual({ login: 'user', senha: 'pass' });
    expect(setTokenValue).toBe('token');
    expect(navigations.length).toBe(1);
    expect(navigations[0]).toEqual(['/jogos']);
  });

  it('deve exibir mensagem de credenciais inválidas quando API retorna 401', () => {
    loginResponse$ = throwError(() => ({ status: 401 }));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.loginForm.setValue({ login: 'user', senha: 'bad' });
    component.onSubmit();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.alertType).toBe('error');
    expect(component.alertMessage).toBe('Credenciais inválidas. Verifique seu usuário e senha.');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.includes('Credenciais inválidas.')).toBe(true);
  });
});
