import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const AuthGuard: CanActivateFn = () => {
  const user = typeof localStorage !== 'undefined' && localStorage.getItem('user');

  if (user) {
    return true;
  } else {
    const router = inject(Router);
    return router.createUrlTree(['/auth']);
  }
};
