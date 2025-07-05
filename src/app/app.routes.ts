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
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'courses',
    loadChildren: () =>
      import('./features/courses/courses.routes').then((m) => m.COURSES_ROUTES),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'instructor',
    loadChildren: () =>
      import('./features/instructor/instructor.routes').then((m) => m.INSTRUCTOR_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'courses',
  },
];
