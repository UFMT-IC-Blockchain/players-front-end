import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EstatisticasService, TopScorer } from './estatisticas.service';
import { environment } from '../../../environments/environment';

type JasmineExpectation = {
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

describe('EstatisticasService', () => {
  let service: EstatisticasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(EstatisticasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTopScorers deve normalizar pontos numéricos e limitar resultados', (done) => {
    const limit = 3;
    const apiMock = [
      { jogadorId: 1, nome: 'A', pontos: '10' },
      { jogadorId: 2, nome: 'B', pontos: 30 },
      { jogadorId: 3, nome: 'C', pontos: '5' },
      { jogadorId: 4, nome: 'D', pontos: '20' }
    ];
    service.getTopScorers(limit).subscribe((items: TopScorer[]) => {
      expect(items.length).toBe(3);
      expect(items).toEqual([
        { jogadorId: 2, nome: 'B', pontos: 30 },
        { jogadorId: 4, nome: 'D', pontos: 20 },
        { jogadorId: 1, nome: 'A', pontos: 10 }
      ]);
      done();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/estatisticas/top-scorers/${limit}`);
    expect(req.request.method).toBe('GET');
    req.flush(apiMock);
  });

  it('getTopScorers deve propagar erro de HTTP', (done) => {
    service.getTopScorers(5).subscribe({
      next: () => fail('deveria falhar'),
      error: () => {
        done();
      }
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/estatisticas/top-scorers/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'server error' }, { status: 500, statusText: 'Server Error' });
  });
});
