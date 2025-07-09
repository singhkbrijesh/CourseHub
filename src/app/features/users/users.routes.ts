import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { MyCoursesComponent } from './my-courses/my-courses.component';
import { MyProgressComponent } from './my-progress/my-progress.component';
import { CertificatesComponent } from './certificates/certificates.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['student']
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'my-courses', component: MyCoursesComponent },
      { path: 'progress', component: MyProgressComponent },
      { path: 'certificates', component: CertificatesComponent }
    ]
  }
];