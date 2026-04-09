import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Jogo, MatchResult, MatchWinnerResult } from '../models/jogo.model';

export type RegistrarResultadoConfrontoRequest = {
  timeId: number;
  pontos: number;
};

export type RegistrarResultadoConfrontoResponse = {
  ok: true;
};

@Injectable({
  providedIn: 'root'
})
export class JogoService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getJogos(): Observable<Jogo[]> {
    return this.http.get<Jogo[]>(`${this.apiUrl}/jogo/all`);
  }

  getJogoById(id: number): Observable<Jogo> {
    return this.http.get<Jogo>(`${this.apiUrl}/jogo/${id}`);
  }

  getJogoResultados(jogoId: number): Observable<MatchResult[]> {
    return this.http.get<MatchResult[]>(`${this.apiUrl}/confrontos/${jogoId}/results`);
  }

  getJogoWinner(jogoId: number): Observable<MatchWinnerResult> {
    return this.http.get<MatchWinnerResult>(`${this.apiUrl}/confrontos/${jogoId}/winner`);
  }

  registrarResultadoConfronto(
    jogoId: number,
    payload: RegistrarResultadoConfrontoRequest
  ): Observable<RegistrarResultadoConfrontoResponse> {
    return this.http.post<RegistrarResultadoConfrontoResponse>(
      `${this.apiUrl}/confrontos/${jogoId}/result`,
      payload
    );
  }

  criarJogo(jogoData: { duracao: number }): Observable<Jogo> {
    return this.http.post<Jogo>(`${this.apiUrl}/jogo/criar`, jogoData);
  }
}
