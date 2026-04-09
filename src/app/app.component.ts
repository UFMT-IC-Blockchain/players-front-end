import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpErrorService } from './core/services/http-error.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly httpErrorService = inject(HttpErrorService);
  readonly globalError$ = this.httpErrorService.error$;

  dismissGlobalError(): void {
    this.httpErrorService.clear();
  }
}
