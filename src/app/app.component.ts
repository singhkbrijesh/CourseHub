import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, NavigationStart, NavigationCancel, NavigationError, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./core/layout/header/header.component";
import { SidebarComponent } from "./core/layout/sidebar/sidebar.component";
import { FooterComponent } from "./core/layout/footer/footer.component";
import { Subscription } from 'rxjs';
import { LoaderComponent } from './shared/loader/loader.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoadingService } from './services/loading.service';
import { MatDialog } from '@angular/material/dialog';
import { IdleWarningComponent } from './shared/idle-warning/idle-warning.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, LoaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'coursehub';
  public sidebarShow: boolean = false;
  public user = { name: '', role: '' };
  public loading = false;

  private routerEventsSub?: Subscription;
  private loadingServiceSub?: Subscription;
  private idleTimer?: any;
  private warningTimer?: any;

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Subscribe to loading service
    this.loadingServiceSub = this.loadingService.loading$.subscribe(
      loading => this.loading = loading
    );

    // Show initial loader
    this.loadingService.show();
    
    this.loadUser();

    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (event instanceof NavigationEnd) {
        this.loadUser();
        this.loadingService.hide();
        
        // Reset idle timer on navigation
        if (this.isUserLoggedIn()) {
          this.resetIdleTimer();
        }
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loadingService.hide();
      }
    });

    // Only add event listeners in browser environment
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.onStorageChange);
      window.addEventListener('userChanged', this.onUserChanged);
      document.addEventListener('mousedown', this.handleClickOutsideSidebar);
      
      // Add activity listeners for idle detection
      this.setupActivityListeners();
    }

    // Hide initial loader after app initialization
    setTimeout(() => {
      this.loadingService.hide();
    }, 500);
  }

  ngOnDestroy() {
    this.routerEventsSub?.unsubscribe();
    this.loadingServiceSub?.unsubscribe();
    
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('storage', this.onStorageChange);
      window.removeEventListener('userChanged', this.onUserChanged);
      document.removeEventListener('mousedown', this.handleClickOutsideSidebar);
      
      // Remove activity listeners
      this.removeActivityListeners();
    }
    
    this.clearIdleTimers();
  }

  private setupActivityListeners() {
    if (isPlatformBrowser(this.platformId)) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, this.resetIdleTimer.bind(this), true);
      });
    }
  }

  private removeActivityListeners() {
    if (isPlatformBrowser(this.platformId)) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.removeEventListener(event, this.resetIdleTimer.bind(this), true);
      });
    }
  }

  private resetIdleTimer() {
    if (!this.isUserLoggedIn()) return;
    
    this.clearIdleTimers();
    
    // Set idle timer for 1 minute (60000ms) for testing
    this.idleTimer = setTimeout(() => {
      this.showIdleWarning();
    }, 900000);
  }

  private showIdleWarning() {
    if (!this.isUserLoggedIn()) return;
    
    // Close any existing dialogs
    this.dialog.closeAll();
    
    // Open the idle warning dialog
    const dialogRef = this.dialog.open(IdleWarningComponent, {
      width: '450px',
      disableClose: true,
      panelClass: 'idle-warning-dialog',
      hasBackdrop: true,
      backdropClass: 'idle-warning-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'stay') {
        // User wants to stay logged in - reset timer
        this.resetIdleTimer();
      } else {
        // User chose logout or dialog timed out
        this.logout();
      }
    });
  }

  private logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userChanged'));
    }
    this.clearIdleTimers();
    this.dialog.closeAll(); // Close any open dialogs
    this.router.navigate(['/auth/login']);
  }

  private clearIdleTimers() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  private isUserLoggedIn(): boolean {
    return this.user.name !== '' && this.user.role !== '';
  }

  handleClickOutsideSidebar = (event: MouseEvent) => {
    if (this.sidebarShow) {
      const sidebar = document.querySelector('.sidebar-slider');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        this.sidebarShow = false;
      }
    }
  };

  loadUser = () => {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      this.user = userData ? JSON.parse(userData) : { name: '', role: '' };
      
      // Start or stop idle monitoring based on login status
      if (this.isUserLoggedIn()) {
        this.resetIdleTimer();
      } else {
        this.clearIdleTimers();
      }
    } else {
      this.user = { name: '', role: '' };
    }
  };

  onStorageChange = (event: StorageEvent) => {
    if (event.key === 'user') {
      this.loadUser();
    }
  };

  onUserChanged = () => {
    this.loadUser();
  };
}