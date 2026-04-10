import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TimesService } from '../../../core/services/times.service';
import { Time } from '../../../core/models/time.model';

@Component({
  selector: 'app-list-times',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-times.component.html',
  styleUrls: ['./list-times.component.scss']
})
export class ListTimesComponent implements OnInit {
  status: 'loading' | 'error' | 'empty' | 'ready' = 'loading';
  errorMessage = '';
  times: Time[] = [];

  constructor(private timesService: TimesService) {}

  ngOnInit(): void {
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
        console.error('Erro ao buscar times', err);
      }
    });
  }

  trackByTimeId(index: number, time: Time): number {
    return time.id ?? index;
  }
}
