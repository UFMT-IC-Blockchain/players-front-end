import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Jogo, MatchResult } from '../models/jogo.model';

@Injectable({
  providedIn: 'root'
})
export class JogoService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getJogos(): Observable<Jogo[]> {
    return this.http.get<Jogo[]>(`${this.apiUrl}/jogo/all`);
  }

  getJogoResultados(jogoId: number): Observable<MatchResult[]> {
    return this.http.get<MatchResult[]>(`${this.apiUrl}/confrontos/${jogoId}/results`);
  }
}
