import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const expectedRoles = route.data['roles'] as string[];

  const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  if (user?.role && expectedRoles.includes(user.role)) {
    return true;
  } else {
    const router = inject(Router);
    return router.createUrlTree(['/']);
  }
};
