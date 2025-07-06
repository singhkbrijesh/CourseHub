import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
  @Input() isSliderOpen: boolean = false;
  @Input() user: { name: string, role: string } = { name: '', role: '' };
  @Output() closeSidebar = new EventEmitter<void>();

  constructor(private router: Router) {}

  get menuItems() {
    switch (this.user.role) {
      case 'admin':
        return [
          { label: 'Admin Dashboard', route: '/admin/admin-dashboard' },
          { label: 'Manage Users', route: '/admin/manage-users' },
          { label: 'Requests', route: '/admin/requests' },
          { label: 'Modify Courses', route: '/admin/modify-courses' }
        ];
      case 'instructor':
        return [
          { label: 'Dashboard', route: '/instructor' },
          { label: 'Modify Courses', route: '/instructor/modify-courses' },
          { label: 'Manage Resources', route: '/instructor/manage-resources' },
          { label: 'Preview Courses', route: '/instructor/preview-courses' },
          { label: 'Approval Status', route: '/instructor/approval-status' }
        ];
      case 'student':
        return [
          { label: 'Dashboard', route: '/users' },
          { label: 'My Courses', route: '/users/my-courses' }
        ];
      default:
        return [];
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