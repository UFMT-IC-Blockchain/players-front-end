import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JogoService } from '../../../core/services/jogo.service'; 
import { Jogo, MatchResult } from '../../../core/models/jogo.model'; 
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-detail-jogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-jogo.component.html',
  styleUrls: ['./detail-jogo.component.scss']
})
export class DetailJogoComponent implements OnInit {
    
  jogo: Jogo | null = null;
  resultados: MatchResult[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService
  ) {}

  ngOnInit(): void {
    
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    
    if (!idParam || isNaN(id) || !Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Jogo não encontrado';
      this.isLoading = false;
      return;
    }

    
    this.carregarDados(id);
  }

  carregarDados(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    
    forkJoin({
      jogo: this.jogoService.getJogoById(id),
      resultados: this.jogoService.getJogoResultados(id)
    }).subscribe({
      next: (res) => {
        this.jogo = res.jogo;
        this.resultados = res.resultados;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        
      
        if (err.status === 404) {
          this.errorMessage = 'Jogo não encontrado';
        } else {
          this.errorMessage = 'Erro ao carregar os dados do jogo.';
        }
        console.error('Erro ao buscar detalhes do jogo', err);
      }
    });
  }

  
  voltar(): void {
    this.router.navigate(['/jogos']);
  }
}