import {inject} from '@angular/core';
import {CanMatchFn, Route, Router, UrlSegment} from '@angular/router';
import {AuthService} from "./auth.service";
import {Observable, of, switchMap, take, tap} from "rxjs";

export const canMatch: CanMatchFn = (
    route: Route,
    segments: UrlSegment[]
): Observable<boolean> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.userIsAuthenticated.pipe(take(1), switchMap(isAuthenticated => {
    if(!isAuthenticated) {
      return authService.autoLogin();
    } else {
      return of(isAuthenticated);
    }
  }), tap(isAuthenticated => {
    if(isAuthenticated) return true;

    router.navigateByUrl('/auth');
    return false;
  }));
}

