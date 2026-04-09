import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JogoService } from '../../../core/services/jogo.service';

@Component({
  selector: 'app-criacao-jogo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './criacao-jogo.component.html',
  styleUrls: ['./criacao-jogo.component.scss']
})
export class CriacaoJogoComponent {
  jogoForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private jogoService: JogoService,
    private router: Router
  ) {
    this.jogoForm = this.fb.group({
      duracao: [null, [Validators.required, Validators.min(1), Validators.max(300)]]
    });
  }

  onSubmit(): void {
    if (this.jogoForm.invalid) {
      this.jogoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.jogoService.criarJogo(this.jogoForm.value).subscribe({
      next: (jogo) => {
        this.isLoading = false;
        this.router.navigate(['/jogos', jogo.id]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao criar jogo. Por favor, tente novamente.';
        console.error('Erro ao criar jogo:', err);
      }
    });
  }
}
