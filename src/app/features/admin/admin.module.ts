import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ADMIN_ROUTES } from './admin.routes';

import { AdminComponent } from './admin/admin.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    AdminComponent,
  ]
})
export class AdminModule { }