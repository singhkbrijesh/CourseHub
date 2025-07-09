import { Component, EventEmitter, inject, Inject, Output, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { MatMenuModule} from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatToolbarModule} from '@angular/material/toolbar';
import { BreadcrumbComponent } from "../../../shared/breadcrumb/breadcrumb.component";
import { filter, Subscription } from 'rxjs';
import { ThemeService, Theme } from '../../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [MatTooltip, MatIconModule, MatMenuModule, MatButtonModule, CommonModule, MatToolbarModule, BreadcrumbComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

  isDarkMode = false;
  isCustomTheme = false;
  isBrowser: boolean;
  user = { name: '', role: '' };
  private router = inject(Router);
  sidebarShow: boolean = false;
  isLoginPage = false;
  
  // Theme properties
  currentTheme: Theme;
  availableThemes: Theme[];
  
  // Subscriptions
  private routerSubscription?: Subscription;
  private themeSubscription?: Subscription;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private themeService: ThemeService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Initialize theme properties
    this.availableThemes = this.themeService.themes;
    this.currentTheme = this.themeService.getCurrentTheme();
    this.isDarkMode = this.themeService.isDarkMode();

    if (this.isBrowser) {
      this.initializeUserTracking();
      this.checkIfLoginPage();
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadUserData();
    }
    
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
      this.isDarkMode = this.themeService.isDarkMode();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private initializeUserTracking(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUserData();
        this.checkIfLoginPage();
      });
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : { name: '', role: '' };
  }

  checkIfLoginPage() {
    this.isLoginPage = this.router.url === '/auth';
  }

  onSidebarToggle() {
    this.sidebarToggle.emit();
  }

  // Updated to use ThemeService
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // New method for selecting specific themes
  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  // Getter for template convenience
  get themeIcon(): string {
    return this.currentTheme.icon;
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