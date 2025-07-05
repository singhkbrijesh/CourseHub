import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  imports: [CommonModule]
})
export class BreadcrumbComponent {
  breadcrumbs: string[] = [];

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
    this.breadcrumbs = path.split('/').filter(x => x);
  }
}