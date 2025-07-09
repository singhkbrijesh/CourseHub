import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { USERS_ROUTES } from './users.routes';
import { RouterModule } from '@angular/router';



@NgModule({
  imports: [
    CommonModule,
    UsersComponent,
    RouterModule.forChild(USERS_ROUTES),
  ]
})
export class UsersModule { }