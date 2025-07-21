import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const expectedRoles = route.data['roles'] as string[];
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user?.role && expectedRoles.includes(user.role)) {
      return true;
    }
  }

  //fallback redirect to courses
  return router.createUrlTree(['/']);
};
