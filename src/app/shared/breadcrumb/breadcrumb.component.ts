import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  path: string;
  isClickable: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  imports: [CommonModule]
})
export class BreadcrumbComponent {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setBreadcrumbs();
    });
    this.setBreadcrumbs();
  }

  setBreadcrumbs() {
    const path = this.router.url.split('?')[0]; // Remove query params
    const segments = path.split('/').filter(x => x);
    
    // Filter out auth-related segments
    const filteredSegments = segments.filter(segment => 
      segment.toLowerCase() !== 'auth' && 
      segment.toLowerCase() !== 'login' && 
      segment.toLowerCase() !== 'register'
    );
    
    this.breadcrumbs = filteredSegments.map((segment, index) => {
      const routePath = '/' + filteredSegments.slice(0, index + 1).join('/');
      const isLast = index === filteredSegments.length - 1;
      
      return {
        label: segment,
        path: routePath,
        isClickable: !isLast // Last item is not clickable as it's the current page
      };
    });
  }

  navigateTo(breadcrumb: BreadcrumbItem) {
    if (breadcrumb.isClickable) {
      this.router.navigate([breadcrumb.path]);
    }
  }
}