import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  goHome() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (user?.role) {
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/admin/admin-dashboard']);
            break;
          case 'instructor':
            this.router.navigate(['/instructor/dashboard']);
            break;
          case 'student':
            this.router.navigate(['/users/dashboard']);
            break;
          default:
            this.router.navigate(['/courses']);
        }
      } else {
        this.router.navigate(['/courses']);
      }
    } else {
      this.router.navigate(['/courses']);
    }
  }

  goBack() {
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    }
  }
}