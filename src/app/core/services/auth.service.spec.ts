import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse } from './auth.service';
import { environment } from '../../../environments/environment';

type JasmineExpectation = {
  toBeTruthy: () => void;
  toEqual: (expected: unknown) => void;
  toBe: (expected: unknown) => void;
  toBeNull: () => void;
};

declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const afterEach: (fn: () => void | Promise<void>) => void;
declare const it: (name: string, fn: (done: DoneFn) => void) => void;
declare const expect: (actual: unknown) => JasmineExpectation;
declare const fail: (message?: string) => void;
interface DoneFn {
  (): void;
  fail: (message?: string | Error) => void;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve fazer POST para /auth/login com body correto e retornar o token', (done) => {
    const credentials = { login: 'user', senha: 'pass' };
    const mockResponse: LoginResponse = { access_token: 'abc123' };

    service.login(credentials).subscribe({
      next: (resp) => {
        expect(resp).toEqual(mockResponse);
        done();
      },
      error: () => fail('não deveria falhar')
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockResponse);
  });

  it('deve propagar erro de HTTP em login', (done) => {
    const credentials = { login: 'user', senha: 'pass' };

    service.login(credentials).subscribe({
      next: () => fail('deveria falhar'),
      error: () => {
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
