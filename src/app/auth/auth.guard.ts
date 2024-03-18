import {inject} from '@angular/core';
import {CanMatchFn, Route, Router, UrlSegment} from '@angular/router';
import {AuthService} from "./auth.service";
import {Observable, take, tap} from "rxjs";

export const canMatch: CanMatchFn = (
    route: Route,
    segments: UrlSegment[]
): Observable<boolean> => {
  let router = inject(Router);
  return inject(AuthService).userIsAuthenticated.pipe(take(1), tap(isAuthenticated => {
    if(isAuthenticated) return true;

    router.navigateByUrl('/auth');
    return false;
  }));
}

