import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Recompensa = {
  id: number;
  valorPago: number;
  hashTransacao: string | null;
  status: string | null;
  dataRegistro: string | null;
  jogador?: { id: number; nome: string | null };
  jogo?: { id: number };
};

type JogadorApiDto = {
  id?: number | string;
  nome?: string | null;
} | null;

type JogoApiDto = {
  id?: number | string;
} | null;

type RecompensaApiDto = {
  id?: number | string;
  valorPago?: number | string;
  valor_pago?: number | string;
  hashTransacao?: string | null;
  hash_transacao?: string | null;
  status?: string | null;
  dataRegistro?: string | null;
  data_registro?: string | null;
  idJogador?: JogadorApiDto;
  id_jogador?: JogadorApiDto;
  idJogo?: JogoApiDto;
  id_jogo?: JogoApiDto;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toStringOrNull = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  return String(value);
};

const normalizeRecompensa = (dto: RecompensaApiDto): Recompensa => {
  const jogadorDto = dto.idJogador ?? dto.id_jogador ?? null;
  const jogoDto = dto.idJogo ?? dto.id_jogo ?? null;

  const jogadorId = jogadorDto ? toNumber(jogadorDto.id, 0) : 0;
  const jogoId = jogoDto ? toNumber(jogoDto.id, 0) : 0;

  return {
    id: toNumber(dto.id, 0),
    valorPago: toNumber(dto.valorPago ?? dto.valor_pago, 0),
    hashTransacao: toStringOrNull(dto.hashTransacao ?? dto.hash_transacao),
    status: toStringOrNull(dto.status),
    dataRegistro: toStringOrNull(dto.dataRegistro ?? dto.data_registro),
    jogador: jogadorId > 0 ? { id: jogadorId, nome: toStringOrNull(jogadorDto?.nome) } : undefined,
    jogo: jogoId > 0 ? { id: jogoId } : undefined
  };
};

@Injectable({
  providedIn: 'root'
})
export class RecompensasService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Recompensa[]> {
    return this.http.get<RecompensaApiDto[]>(`${this.apiUrl}/recompensas`).pipe(
      map((rows) => (rows ?? []).map(normalizeRecompensa))
    );
  }

  getByJogadorId(jogadorId: number): Observable<Recompensa[]> {
    return this.http
      .get<RecompensaApiDto[]>(`${this.apiUrl}/recompensas/jogador/${jogadorId}`)
      .pipe(map((rows) => (rows ?? []).map(normalizeRecompensa)));
  }

  getByJogoId(jogoId: number): Observable<Recompensa[]> {
    return this.http
      .get<RecompensaApiDto[]>(`${this.apiUrl}/recompensas/jogo/${jogoId}`)
      .pipe(map((rows) => (rows ?? []).map(normalizeRecompensa)));
  }

  getByStatus(status: string): Observable<Recompensa[]> {
    const normalized = status.trim();
    return this.http
      .get<RecompensaApiDto[]>(`${this.apiUrl}/recompensas/status/${encodeURIComponent(normalized)}`)
      .pipe(map((rows) => (rows ?? []).map(normalizeRecompensa)));
  }
}
