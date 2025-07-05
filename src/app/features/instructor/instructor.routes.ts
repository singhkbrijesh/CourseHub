import { Routes } from '@angular/router';
import { InstructorComponent } from './instructor/instructor.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const INSTRUCTOR_ROUTES: Routes = [
  {
    path: '',
    component: InstructorComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['instructor']
    }
  },
];
