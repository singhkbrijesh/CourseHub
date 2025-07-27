import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { CourseApprovalsComponent } from './course-approvals/course-approvals.component';
import { ManageCoursesComponent } from './manage-courses/manage-courses.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EditCourseComponent } from '../instructor/edit-course/edit-course.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['admin']
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'course-approvals', component: CourseApprovalsComponent },
      { path: 'manage-courses', component: ManageCoursesComponent },
      { path: 'edit-course/:id', component: EditCourseComponent },
    ]
  }
];