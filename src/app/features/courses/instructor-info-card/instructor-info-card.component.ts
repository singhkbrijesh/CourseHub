import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-instructor-info-card',
  imports: [CommonModule],
  templateUrl: './instructor-info-card.component.html',
  styleUrl: './instructor-info-card.component.scss'
})
export class InstructorInfoCardComponent {
  @Input() instructorInfo: any;

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }
}
