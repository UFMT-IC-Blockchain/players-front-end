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

  getJogadorByCarteiraStellar(wallet: string): Observable<Jogador> {
    return this.http.get<Jogador>(`${this.apiUrl}/jogadores/stellar/${wallet}`);
  }
}
