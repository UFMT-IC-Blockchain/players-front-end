import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JogadoresService } from '../../../core/services/jogadores.service';
import { Jogador } from '../../../core/models/jogador.model';

type BuscaState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; jogador: Jogador }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

type BuscaForm = FormGroup<{
  wallet: FormControl<string>;
}>;

const stellarWalletRegex = /^G[A-Z2-7]{55}$/;

@Component({
  selector: 'app-busca-jogador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './busca-jogador.component.html',
  styleUrls: ['./busca-jogador.component.scss']
})
export class BuscaJogadorComponent {
  state: BuscaState = { status: 'idle' };

  form: BuscaForm = new FormGroup({
    wallet: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(stellarWalletRegex)]
    })
  });

  get walletCtrl(): FormControl<string> {
    return this.form.controls.wallet;
  }

  constructor(private jogadoresService: JogadoresService) {}

  onBuscar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.state = { status: 'idle' };
      return;
    }

    const wallet = this.form.getRawValue().wallet.trim();
    if (!stellarWalletRegex.test(wallet)) {
      this.form.markAllAsTouched();
      this.state = { status: 'idle' };
      return;
    }

    this.state = { status: 'loading' };
    this.jogadoresService.getJogadorByCarteiraStellar(wallet).subscribe({
      next: (jogador) => {
        this.state = { status: 'ready', jogador };
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.state = { status: 'not_found' };
          return;
        }
        this.state = { status: 'error', message: 'Falha ao buscar jogador.' };
      }
    });
  }

  onLimpar(): void {
    this.form.reset({ wallet: '' });
    this.state = { status: 'idle' };
  }
}
