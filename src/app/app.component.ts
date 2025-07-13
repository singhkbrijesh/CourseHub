import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, NavigationStart, NavigationCancel, NavigationError, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./core/layout/header/header.component";
import { SidebarComponent } from "./core/layout/sidebar/sidebar.component";
import { FooterComponent } from "./core/layout/footer/footer.component";
import { Subscription } from 'rxjs';
import { LoaderComponent } from './shared/loader/loader.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoadingService } from './services/loading.service';

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

  constructor(
    private router: Router,
    private loadingService: LoadingService,
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
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loadingService.hide();
      }
    });

    // Only add event listeners in browser environment
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.onStorageChange);
      window.addEventListener('userChanged', this.onUserChanged);
      document.addEventListener('mousedown', this.handleClickOutsideSidebar);
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