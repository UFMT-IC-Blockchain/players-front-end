import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-time-detail-stub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './time-detail-stub.component.html',
  styleUrls: ['./time-detail-stub.component.scss']
})
export class TimeDetailStubComponent {
  timeId: number;

  constructor(route: ActivatedRoute) {
    this.timeId = Number(route.snapshot.paramMap.get('id'));
  }
}
