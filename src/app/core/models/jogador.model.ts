import { Time } from './time.model';

export type Jogador = {
  id: number;
  nome: string | null;
  carteiraStellar: string | null;
  idTime?: Time | null;
};
