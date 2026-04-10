import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FeedbackType = 'success' | 'error' | 'info';

export type FeedbackMessage = {
  id: string;
  type: FeedbackType;
  message: string;
  title?: string;
  createdAt: number;
};

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly messagesSubject = new BehaviorSubject<FeedbackMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  show(type: FeedbackType, message: string, title?: string): string {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next: FeedbackMessage = {
      id,
      type,
      message,
      title,
      createdAt: Date.now()
    };
    this.messagesSubject.next([next, ...this.messagesSubject.value].slice(0, 3));
    return id;
  }

  dismiss(id: string): void {
    this.messagesSubject.next(this.messagesSubject.value.filter((msg) => msg.id !== id));
  }

  clear(): void {
    this.messagesSubject.next([]);
  }
}
