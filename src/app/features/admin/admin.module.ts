import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ADMIN_ROUTES } from './admin.routes';

// Import your admin components
import { AdminComponent } from './admin/admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
// import other admin components as needed

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    AdminDashboardComponent,
    AdminComponent
  ]
})
export class AdminModule { }