import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Jogo, JogoComDetalhes, MatchResult, MatchWinnerResult } from '../models/jogo.model';

@Injectable({
  providedIn: 'root'
})
export class JogoService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getJogos(): Observable<JogoComDetalhes[]> {
    return this.http.get<JogoComDetalhes[]>(`${this.apiUrl}/jogo/all`);
  }

  getJogoById(id: number): Observable<Jogo> {
    return this.http.get<Jogo>(`${this.apiUrl}/jogo/${id}`);
  }

  getJogoResultados(jogoId: number): Observable<MatchResult[]> {
    return this.http.get<any[]>(`${this.apiUrl}/confrontos/${jogoId}/results`).pipe(
      map((results) =>
        results.map((res) => ({
          timeId: res.idTime,
          pontuacao: res.pontuacao,
          vencedor: res.vencedor,
          idJogo: res.idJogo
        } as MatchResult))
      )
    );
  }

  getJogoWinner(jogoId: number): Observable<MatchWinnerResult> {
    return this.http.get<MatchWinnerResult>(`${this.apiUrl}/confrontos/${jogoId}/winner`);
  }

  criarJogo(duracao: number): Observable<Jogo> {
    return this.http.post<Jogo>(`${this.apiUrl}/jogo/criar`, { duracao });
  }

  registrarResultadoConfronto(jogoId: number, data: { timeId: number; pontos: number }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/confrontos/${jogoId}/result`, data);
  }

  deleteMatchResult(jogoId: number, timeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/confrontos/${jogoId}/result/${timeId}`);
  }
}
