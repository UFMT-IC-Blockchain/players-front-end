export interface Jogo {
  id: number;
  duracao: number;
}

export interface MatchResult {
  timeId: number;
  pontuacao: number;
  vencedor: boolean;
  idJogo?: number;
}

export type MatchScore = {
  timeId: number;
  pontos: number;
};

export type MatchWinnerResult = {
  jogoId: number;
  empate: boolean;
  vencedorTimeId: number | null;
  placares: MatchScore[];
};

export interface JogoComDetalhes extends Jogo {
  resultados?: MatchResult[];
}
