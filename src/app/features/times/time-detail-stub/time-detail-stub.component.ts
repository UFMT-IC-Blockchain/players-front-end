import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimesService } from '../../../core/services/times.service';
import { TimeDetail } from '../../../core/models/time.model';

@Component({
  selector: 'app-time-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './time-detail-stub.component.html',
  styleUrls: ['./time-detail-stub.component.scss']
})
export class TimeDetailComponent implements OnInit {
  status: 'loading' | 'error' | 'not_found' | 'ready' = 'loading';
  timeId: number | null = null;
  errorMessage = '';
  time: TimeDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private timesService: TimesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
      this.status = 'error';
      this.errorMessage = 'ID de time inválido.';
      return;
    }

    this.timeId = id;
    this.loadTime();
  }

  loadTime(): void {
    if (this.timeId === null) {
      this.status = 'error';
      this.errorMessage = 'ID de time inválido.';
      return;
    }

    this.status = 'loading';
    this.errorMessage = '';
    this.time = null;

    this.timesService.getTimeById(this.timeId).subscribe({
      next: (data) => {
        this.time = data;
        this.status = 'ready';
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.status = 'not_found';
          return;
        }

        this.status = 'error';
        this.errorMessage = 'Falha ao carregar o time.';
      }
    });
  }
}
