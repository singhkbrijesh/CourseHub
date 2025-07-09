import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const AuthGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const user = localStorage.getItem('user');
    if (user) {
      return true;
    }
  }
  
  return router.createUrlTree(['/auth']);
};
