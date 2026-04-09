import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JogoService } from '../../../core/services/jogo.service';
import { JogoComDetalhes } from '../../../core/models/jogo.model';

type ResultadosState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-list-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-jogos.component.html',
  styleUrls: ['./list-jogos.component.scss']
})
export class ListJogosComponent implements OnInit {
  jogos: JogoComDetalhes[] = [];
  resultadosStateByJogoId = new Map<number, ResultadosState>();
  isLoading = true;
  errorMessage = '';

  constructor(private jogoService: JogoService) {}

  ngOnInit(): void {
    this.loadJogos();
  }

  loadJogos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.jogoService.getJogos().subscribe({
      next: (jogosData) => {
        this.jogos = [...jogosData].sort((a, b) => b.id - a.id);
        this.jogos.forEach((jogo) => this.loadResultadosForJogo(jogo));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Falha ao carregar a lista de jogos.';
        console.error('Erro ao buscar jogos', err);
      }
    });
  }

  loadResultadosForJogo(jogo: JogoComDetalhes): void {
    this.resultadosStateByJogoId.set(jogo.id, { status: 'loading' });
    jogo.resultados = undefined;

    this.jogoService.getJogoResultados(jogo.id).subscribe({
      next: (resultados) => {
        jogo.resultados = resultados;
        this.resultadosStateByJogoId.set(jogo.id, { status: 'loaded' });
      },
      error: (err) => {
        jogo.resultados = [];
        this.resultadosStateByJogoId.set(jogo.id, {
          status: 'error',
          message: 'Falha ao carregar resultados.'
        });
        console.error(`Erro ao carregar resultados para o jogo ${jogo.id}`, err);
      }
    });
  }

  trackByJogoId(index: number, jogo: JogoComDetalhes): number {
    return jogo.id ?? index;
  }
}
