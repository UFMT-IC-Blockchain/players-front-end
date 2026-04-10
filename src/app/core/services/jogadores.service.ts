import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Jogador } from '../models/jogador.model';

@Injectable({
  providedIn: 'root'
})
export class JogadoresService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getJogadores(): Observable<Jogador[]> {
    return this.http.get<Jogador[]>(`${this.apiUrl}/jogadores`);
  }

  getJogadorByCarteiraStellar(wallet: string): Observable<Jogador> {
    return this.http.get<Jogador>(`${this.apiUrl}/jogadores/stellar/${wallet}`);
  }

  createJogador(data: { nome: string; wallet: string; timeId?: number }): Observable<Jogador> {
    return this.http.post<Jogador>(`${this.apiUrl}/jogadores`, data);
  }

  updateJogador(id: number, data: { nome?: string; wallet?: string; timeId?: number }): Observable<Jogador> {
    return this.http.patch<Jogador>(`${this.apiUrl}/jogadores/${id}`, data);
  }

  deleteJogador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/jogadores/${id}`);
  }
}
