export interface Jogo {
  id: number;
  duracao: number;
}

export interface MatchResult {
  timeId: number;
  pontuacao: number;
  vencedor: boolean;
  idJogo: number;
}

export interface JogoComDetalhes extends Jogo {
  resultados?: MatchResult[];
}
