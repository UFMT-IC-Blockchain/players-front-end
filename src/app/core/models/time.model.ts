export type Time = {
  id: number;
  nome?: string;
  sigla?: string;
};

export type TimeJogador = {
  id: number;
  nome: string;
  carteiraStellar?: string | null;
};

export type TimeJogoResumo = {
  idTime?: number;
  idJogo: number;
  pontuacao: number;
  vencedor: boolean;
};

export type TimeDetail = Time & {
  jogadors?: TimeJogador[];
  timeJogos?: TimeJogoResumo[];
};
