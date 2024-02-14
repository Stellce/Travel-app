import {inject} from '@angular/core';
import {CanMatchFn, Route, Router, UrlSegment} from '@angular/router';
import {AuthService} from "./auth.service";

export const canMatch: CanMatchFn = (
    route: Route,
    segments: UrlSegment[]
): boolean => {
  let router = inject(Router);
  if (!inject(AuthService).userIsAuthenticated) {
    router.navigateByUrl('/auth');
    return false;
  }
  return true;
}

