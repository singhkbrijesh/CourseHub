import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'courses',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'courses',
    loadChildren: () =>
      import('./features/courses/courses.module').then((m) => m.CoursesModule),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'instructor',
    loadChildren: () =>
      import('./features/instructor/instructor.module').then((m) => m.InstructorModule),
  },
  {
    path: '**',
    redirectTo: 'courses',
  },
];
