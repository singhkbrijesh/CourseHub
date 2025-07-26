import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  route: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() isSliderOpen: boolean = false;
  @Input() user: { name: string, role: string } = { name: '', role: '' };
  @Output() closeSidebar = new EventEmitter<void>();
  menuItems: MenuItem[] = [];
  currentRoute: string = '';

  constructor(private router: Router) { 
    // Listen to router events to update active state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      this.updateActiveState();
    });
  }
  
  ngOnInit() {
    this.currentRoute = this.router.url;
    this.updateMenuItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].currentValue) {
      this.updateMenuItems();
    }
  }

  private updateMenuItems() {
    if (this.user?.role) {
      this.setMenuItems(this.user.role);
      this.updateActiveState();
    } else {
      this.menuItems = [];
    }
  }

  private updateActiveState() {
    this.menuItems.forEach(item => {
      // Check if current route matches or starts with the menu item route
      item.isActive = this.currentRoute === item.route || 
                     this.currentRoute.startsWith(item.route + '/');
    });
  }

  setMenuItems(role: string) {
    switch (role) {
      case 'admin':
        this.menuItems = [
          { label: 'Admin Dashboard', route: '/admin/dashboard' },
          { label: 'Manage Users', route: '/admin/manage-users' },
          { label: 'Course Approvals', route: '/admin/course-approvals' },
          { label: 'Manage Courses', route: '/admin/manage-courses' },
          { label: 'Reports', route: '/admin/reports' }
        ];
        break;
      case 'instructor':
        this.menuItems = [
          { label: 'Dashboard', route: '/instructor/dashboard' },
          { label: 'My Courses', route: '/instructor/my-courses' },
          { label: 'Create Course', route: '/instructor/create-course' },
        ];
        break;
      case 'student':
        this.menuItems = [
          { label: 'Dashboard', route: '/users/dashboard' },
          { label: 'Browse Courses', route: '/courses' },
          { label: 'My Courses', route: '/users/my-courses' },
        ];
        break;
      default:
        this.menuItems = [];
    }
  }

  onMenuClick(route: string) {
    this.router.navigate([route]);
    this.closeSidebar.emit();
  }

  onClose() {
    this.closeSidebar.emit();
  }
}