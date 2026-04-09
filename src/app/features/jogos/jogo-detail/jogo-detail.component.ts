import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JogoService } from '../../../core/services/jogo.service';
import { Jogo, MatchResult } from '../../../core/models/jogo.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-jogo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jogo-detail.component.html',
  styleUrls: ['./jogo-detail.component.scss']
})
export class JogoDetailComponent implements OnInit {
  jogo: Jogo | null = null;
  resultados: MatchResult[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private jogoService: JogoService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    
    if (!idParam || isNaN(id) || id <= 0) {
      this.error = 'ID de jogo inválido';
      this.loading = false;
      return;
    }

    forkJoin({
      jogo: this.jogoService.getJogoById(id).pipe(
        catchError(err => {
          if (err.status === 404) {
            this.error = 'Jogo não encontrado';
          } else {
            this.error = 'Erro ao carregar o jogo';
          }
          console.error('Erro ao carregar jogo:', err);
          return of(null);
        })
      ),
      resultados: this.jogoService.getJogoResultados(id).pipe(
        catchError(err => {
          console.error('Erro ao carregar resultados:', err);
          return of([]);
        })
      )
    }).subscribe(({ jogo, resultados }) => {
      this.jogo = jogo;
      this.resultados = resultados;
      this.loading = false;
    });
  }
}
