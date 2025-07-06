import { Component, EventEmitter, inject, Inject, Output, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { MatMenuModule} from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatToolbarModule} from '@angular/material/toolbar';
import { BreadcrumbComponent } from "../../../shared/breadcrumb/breadcrumb.component";
import { filter } from 'rxjs';


@Component({
  selector: 'app-header',
  imports: [MatTooltip, MatIconModule, MatMenuModule, MatButtonModule, CommonModule, MatToolbarModule, BreadcrumbComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  isDarkMode = false;
  isCustomTheme = false;
  isBrowser: boolean;
  user = { name: '', role: '' };
  private router = inject(Router);
  sidebarShow: boolean = false;
  isLoginPage = false;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const storedTheme = localStorage.getItem('theme');
      this.isDarkMode = storedTheme === 'dark';
      this.applyTheme();

      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          const userData = localStorage.getItem('user');
          this.user = userData ? JSON.parse(userData) : { name: '', role: '' };
          this.checkIfLoginPage();
        });
        this.checkIfLoginPage();
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  checkIfLoginPage() {
    this.isLoginPage = this.router.url === '/auth';
  }

  onSidebarToggle() {
    this.sidebarToggle.emit();
  }

  toggleTheme() {
    if (this.isBrowser) {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  applyTheme() {
    if (this.isBrowser) {
      const body = document.body;
      body.classList.remove('light-theme', 'dark-theme');
      body.classList.add(this.isDarkMode ? 'dark-theme' : 'light-theme');
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.clear();
      this.router.navigate(['/auth']);
    }
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }
}
