import { Routes } from '@angular/router';
import { InstructorComponent } from './instructor/instructor.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { InstructorDashboardComponent } from './instructor-dashboard/instructor-dashboard.component';
import { MyCoursesComponent } from './my-courses/my-courses.component';
import { CreateCourseComponent } from './create-course/create-course.component';
import { EditCourseComponent } from './edit-course/edit-course.component';

export const INSTRUCTOR_ROUTES: Routes = [
  {
    path: '',
    component: InstructorComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['instructor']
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: InstructorDashboardComponent },
      { path: 'my-courses', component: MyCoursesComponent },
      { path: 'create-course', component: CreateCourseComponent },
      { path: 'edit-course/:id', component: EditCourseComponent },
    ]
  }
];