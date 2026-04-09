import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type GlobalHttpError = {
  message: string;
  status: number;
  occurredAt: number;
};

@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {
  private readonly errorSubject = new BehaviorSubject<GlobalHttpError | null>(null);
  readonly error$ = this.errorSubject.asObservable();

  showMessage(message: string, status: number): void {
    this.errorSubject.next({
      message,
      status,
      occurredAt: Date.now()
    });
  }

  clear(): void {
    this.errorSubject.next(null);
  }
}
