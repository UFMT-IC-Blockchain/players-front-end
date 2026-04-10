import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpErrorService } from './core/services/http-error.service';
import { FeedbackMessage, FeedbackService } from './core/services/feedback.service';
import { AlertComponent } from './shared/components/alert/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NgFor, AsyncPipe, AlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly httpErrorService = inject(HttpErrorService);
  private readonly feedbackService = inject(FeedbackService);
  readonly globalError$ = this.httpErrorService.error$;
  readonly feedbackMessages$ = this.feedbackService.messages$;

  dismissGlobalError(): void {
    this.httpErrorService.clear();
  }

  dismissFeedback(id: string): void {
    this.feedbackService.dismiss(id);
  }

  trackByFeedbackId(index: number, item: FeedbackMessage): string {
    return item.id ?? String(index);
  }
}
