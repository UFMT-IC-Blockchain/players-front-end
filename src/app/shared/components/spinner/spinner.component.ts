import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { NgIf } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [NgIf],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() label: string | null = null;
  @Input() size: SpinnerSize = 'md';
  @Input() inline = false;

  @HostBinding('class')
  get hostClass(): string {
    const classes = ['spinner-host', `size-${this.size}`];
    if (this.inline) classes.push('inline');
    return classes.join(' ');
  }
}
