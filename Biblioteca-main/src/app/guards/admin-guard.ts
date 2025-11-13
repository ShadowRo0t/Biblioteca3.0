import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';

import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanMatch, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canMatch(_route: Route, _segments: UrlSegment[]): boolean {
    return this.checkAccess();
  }

  canActivateChild(_childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    return this.checkAccess();
  }

  private checkAccess(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}


