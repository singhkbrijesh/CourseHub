import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['student']
    }
  }
];
