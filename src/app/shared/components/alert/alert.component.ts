import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

export type AlertType = 'error' | 'success' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgIf],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input({ required: true }) message!: string;
  @Input() title: string | null = null;
  @Input() type: AlertType = 'info';
  @Input() dismissible = false;

  @Output() dismissed = new EventEmitter<void>();

  @HostBinding('class')
  get hostClass(): string {
    return ['alert-host', `type-${this.type}`].join(' ');
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
