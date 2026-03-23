import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JogoService } from '../../../core/services/jogo.service';
import { JogoComDetalhes } from '../../../core/models/jogo.model';

@Component({
  selector: 'app-list-jogos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-jogos.component.html',
  styleUrls: ['./list-jogos.component.scss']
})
export class ListJogosComponent implements OnInit {
  jogos: JogoComDetalhes[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private jogoService: JogoService) {}

  ngOnInit(): void {
    this.loadJogos();
  }

  loadJogos(): void {
    this.isLoading = true;
    this.jogoService.getJogos().subscribe({
      next: (jogosData) => {
        this.jogos = jogosData;
        
        // Fetch results for each jogo
        this.jogos.forEach(jogo => {
          this.jogoService.getJogoResultados(jogo.id).subscribe({
            next: (resultados) => {
              jogo.resultados = resultados;
            },
            error: (err) => {
              console.error(`Erro ao carregar resultados para o jogo ${jogo.id}`, err);
            }
          });
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Falha ao carregar a lista de jogos.';
        console.error('Erro ao buscar jogos', err);
      }
    });
  }
}
