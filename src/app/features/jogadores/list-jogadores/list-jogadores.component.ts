import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JogadoresService } from '../../../core/services/jogadores.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimesService } from '../../../core/services/times.service';
import { Jogador } from '../../../core/models/jogador.model';
import { Time } from '../../../core/models/time.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-list-jogadores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlertComponent, SpinnerComponent, ModalComponent],
  templateUrl: './list-jogadores.component.html',
  styleUrls: ['./list-jogadores.component.scss']
})
export class ListJogadoresComponent implements OnInit {
  status: 'loading' | 'error' | 'empty' | 'ready' = 'loading';
  errorMessage = '';
  jogadores: Jogador[] = [];
  times: Time[] = [];
  
  isAdmin = false;
  isModalOpen = false;
  jogadorToDelete: Jogador | null = null;
  isEditing = false;
  editingJogador: Jogador | null = null;
  
  form = {
    nome: '',
    wallet: '',
    timeId: null as number | null
  };

  private jogadoresService = inject(JogadoresService);
  private authService = inject(AuthService);
  private timesService = inject(TimesService);

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRoleFromToken('ADMIN') ?? false;
    this.loadJogadores();
    if (this.isAdmin) {
      this.loadTimes();
    }
  }

  loadJogadores(): void {
    this.status = 'loading';
    this.errorMessage = '';
    this.jogadoresService.getJogadores().subscribe({
      next: (data) => {
        this.jogadores = data ?? [];
        this.status = this.jogadores.length > 0 ? 'ready' : 'empty';
      },
      error: () => {
        this.status = 'error';
        this.errorMessage = 'Falha ao carregar a lista de jogadores.';
      }
    });
  }

  loadTimes(): void {
    this.timesService.getTimes().subscribe(data => this.times = data);
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingJogador = null;
    this.form = { nome: '', wallet: '', timeId: null };
    this.isModalOpen = true;
  }

  openEditModal(jogador: Jogador): void {
    this.isEditing = true;
    this.editingJogador = jogador;
    this.form = { 
      nome: jogador.nome ?? '', 
      wallet: jogador.carteiraStellar ?? '', 
      timeId: jogador.idTime?.id ?? null 
    };
    this.isModalOpen = true;
  }

  openDeleteConfirm(jogador: Jogador): void {
    this.jogadorToDelete = jogador;
    this.isModalOpen = true;
  }

  confirmAction(): void {
    if (this.jogadorToDelete) {
      this.jogadoresService.deleteJogador(this.jogadorToDelete.id).subscribe(() => {
        this.loadJogadores();
        this.closeModal();
      });
    } else if (this.isEditing && this.editingJogador) {
      const updateData = {
        nome: this.form.nome || undefined,
        wallet: this.form.wallet || undefined,
        timeId: this.form.timeId || undefined
      };
      this.jogadoresService.updateJogador(this.editingJogador.id, updateData).subscribe(() => {
        this.loadJogadores();
        this.closeModal();
      });
    } else {
      const createData = {
        nome: this.form.nome,
        wallet: this.form.wallet,
        timeId: this.form.timeId || undefined
      };
      this.jogadoresService.createJogador(createData).subscribe(() => {
        this.loadJogadores();
        this.closeModal();
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.jogadorToDelete = null;
    this.editingJogador = null;
  }

  trackByJogadorId(index: number, j: Jogador): number {
    return j.id ?? index;
  }
}
