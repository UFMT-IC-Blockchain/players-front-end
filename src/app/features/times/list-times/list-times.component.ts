import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TimesService } from '../../../core/services/times.service';
import { AuthService } from '../../../core/services/auth.service';
import { Time } from '../../../core/models/time.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-list-times',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlertComponent, SpinnerComponent, ModalComponent],
  templateUrl: './list-times.component.html',
  styleUrls: ['./list-times.component.scss']
})
export class ListTimesComponent implements OnInit {
  status: 'loading' | 'error' | 'empty' | 'ready' = 'loading';
  errorMessage = '';
  times: Time[] = [];
  
  isAdmin = false;
  isModalOpen = false;
  timeToDelete: Time | null = null;
  isEditing = false;
  editingTime: Time | null = null;
  timeName = '';

  private timesService = inject(TimesService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRoleFromToken('ADMIN') ?? false;
    this.loadTimes();
  }

  loadTimes(): void {
    this.status = 'loading';
    this.errorMessage = '';
    this.timesService.getTimes().subscribe({
      next: (data) => {
        this.times = data ?? [];
        this.status = this.times.length > 0 ? 'ready' : 'empty';
      },
      error: (err) => {
        this.status = 'error';
        this.errorMessage = 'Falha ao carregar a lista de times.';
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingTime = null;
    this.timeName = '';
    this.isModalOpen = true;
  }

  openEditModal(time: Time): void {
    this.isEditing = true;
    this.editingTime = time;
    this.timeName = time.nome || '';
    this.isModalOpen = true;
  }

  confirmAction(): void {
    if (this.timeToDelete) {
      this.timesService.deleteTime(this.timeToDelete.id).subscribe(() => {
        this.loadTimes();
        this.closeModal();
      });
    } else if (this.isEditing && this.editingTime) {
      this.timesService.updateTime(this.editingTime.id, this.timeName).subscribe(() => {
        this.loadTimes();
        this.closeModal();
      });
    } else {
      this.timesService.createTime(this.timeName).subscribe(() => {
        this.loadTimes();
        this.closeModal();
      });
    }
  }

  openDeleteConfirm(time: Time): void {
    this.timeToDelete = time;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.timeToDelete = null;
    this.editingTime = null;
    this.timeName = '';
  }

  trackByTimeId(index: number, time: Time): number {
    return time.id ?? index;
  }
}
