import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JogoService, RegistrarResultadoConfrontoRequest, RegistrarResultadoConfrontoResponse } from './jogo.service';
import { environment } from '../../../environments/environment';
import { Jogo, MatchResult, MatchWinnerResult } from '../models/jogo.model';

type JasmineExpectation = {
  toBeTruthy: () => void;
  toEqual: (expected: unknown) => void;
  toBe: (expected: unknown) => void;
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

describe('JogoService', () => {
  let service: JogoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(JogoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getJogos deve fazer GET para /jogo/all', (done) => {
    const mock: Jogo[] = [{ id: 1, duracao: 10 }];
    service.getJogos().subscribe((data) => {
      expect(data).toEqual(mock);
      done();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/jogo/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getJogoById deve fazer GET para /jogo/:id e propagar erro', (done) => {
    const id = 42;
    service.getJogoById(id).subscribe({
      next: () => fail('deveria falhar'),
      error: () => {
        done();
      }
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/jogo/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });
  });

  it('getJogoResultados deve fazer GET para /confrontos/:id/results', (done) => {
    const id = 7;
    const mock: MatchResult[] = [{ timeId: 1, pontuacao: 3, vencedor: false, idJogo: id }];
    service.getJogoResultados(id).subscribe((data) => {
      expect(data).toEqual(mock);
      done();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/confrontos/${id}/results`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getJogoWinner deve fazer GET para /confrontos/:id/winner', (done) => {
    const id = 7;
    const mock: MatchWinnerResult = {
      jogoId: id,
      empate: false,
      vencedorTimeId: 2,
      placares: [{ timeId: 2, pontos: 5 }]
    };
    service.getJogoWinner(id).subscribe((data) => {
      expect(data).toEqual(mock);
      done();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/confrontos/${id}/winner`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('registrarResultadoConfronto deve fazer POST para /confrontos/:id/result com body correto', (done) => {
    const id = 9;
    const payload: RegistrarResultadoConfrontoRequest = { timeId: 3, pontos: 2 };
    const mock: RegistrarResultadoConfrontoResponse = { ok: true };
    service.registrarResultadoConfronto(id, payload).subscribe((data) => {
      expect(data).toEqual(mock);
      done();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/confrontos/${id}/result`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mock);
  });
});
