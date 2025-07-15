import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-idle-warning',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './idle-warning.component.html',
  styleUrl: './idle-warning.component.scss'
})
export class IdleWarningComponent implements OnInit, OnDestroy {
  countdown = 60;
  private countdownSubscription?: Subscription;

  constructor(
    private dialogRef: MatDialogRef<IdleWarningComponent>
  ) {}

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  private startCountdown() {
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.logout();
      }
    });
  }

  stayLoggedIn() {
    this.dialogRef.close('stay');
  }

  logout() {
    this.dialogRef.close('logout');
  }
}