import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TopScorer = {
  jogadorId: number;
  nome: string;
  pontos: number;
};

type TopScorerApiDto = {
  jogadorId: number;
  nome: string;
  pontos: number | string;
};

@Injectable({
  providedIn: 'root'
})
export class EstatisticasService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTopScorers(limit: number): Observable<TopScorer[]> {
    return this.http
      .get<TopScorerApiDto[]>(`${this.apiUrl}/estatisticas/top-scorers/${limit}`)
      .pipe(
        map((rows) =>
          (rows ?? []).map((row) => ({
            jogadorId: Number(row.jogadorId),
            nome: String(row.nome ?? ''),
            pontos: Number(row.pontos ?? 0)
          }))
        ),
        map((items) => [...items].sort((a, b) => b.pontos - a.pontos).slice(0, limit))
      );
  }
}
