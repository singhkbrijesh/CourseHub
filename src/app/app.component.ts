import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./core/layout/header/header.component";
import { SidebarComponent } from "./core/layout/sidebar/sidebar.component";
import { FooterComponent } from "./core/layout/footer/footer.component";
import { Subscription } from 'rxjs';
import { LoaderComponent } from './shared/loader/loader.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
  private loadingTimer: any; // Added this

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Show initial loader for 2 seconds
    this.showLoaderWithDelay(2000);
    
    this.loadUser();

    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadUser();
      } else if (event.constructor.name === 'NavigationStart') {
        this.showLoaderWithDelay(1500); // Show loader with 1.5 second minimum delay
      } else if (
        event.constructor.name === 'NavigationCancel' ||
        event.constructor.name === 'NavigationError'
      ) {
        if (this.loadingTimer) {
          clearTimeout(this.loadingTimer);
        }
        this.loading = false;
      }
    });

    // Only add event listeners in browser environment
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.onStorageChange);
      window.addEventListener('userChanged', this.onUserChanged);
      document.addEventListener('mousedown', this.handleClickOutsideSidebar);
    }
  }

  // Added this method
  private showLoaderWithDelay(minDelayMs: number = 1500) {
    this.loading = true;
    
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    
    this.loadingTimer = setTimeout(() => {
      this.loading = false;
    }, minDelayMs);
  }

  ngOnDestroy() {
    this.routerEventsSub?.unsubscribe();
    
    // Clear loading timer
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('storage', this.onStorageChange);
      window.removeEventListener('userChanged', this.onUserChanged);
      document.removeEventListener('mousedown', this.handleClickOutsideSidebar);
    }
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