import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./core/layout/header/header.component";
import { SidebarComponent } from "./core/layout/sidebar/sidebar.component";
import { FooterComponent } from "./core/layout/footer/footer.component";
import { Subscription } from 'rxjs';
import { LoaderComponent } from './shared/loader/loader.component';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUser();

    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadUser();
        this.loading = false;
      } else if (event.constructor.name === 'NavigationStart') {
        this.loading = true;
      } else if (
        event.constructor.name === 'NavigationCancel' ||
        event.constructor.name === 'NavigationError'
      ) {
        this.loading = false;
      }
    });

    // Update user on route change
    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadUser();
      }
    });

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', this.onStorageChange);

    // Listen for custom login/logout events (optional, see below)
    window.addEventListener('userChanged', this.onUserChanged);

    document.addEventListener('mousedown', this.handleClickOutsideSidebar);
  }

  ngOnDestroy() {
    this.routerEventsSub?.unsubscribe();
    window.removeEventListener('storage', this.onStorageChange);
    window.removeEventListener('userChanged', this.onUserChanged);
    document.removeEventListener('mousedown', this.handleClickOutsideSidebar);
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
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : { name: '', role: '' };
  };

  // For storage event
  onStorageChange = (event: StorageEvent) => {
    if (event.key === 'user') {
      this.loadUser();
    }
  };

  // For custom event
  onUserChanged = () => {
    this.loadUser();
  };
}
