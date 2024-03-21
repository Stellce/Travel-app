import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {SplashScreen} from "@capacitor/splash-screen";
import {Subscription, take} from "rxjs";
import {App, AppState} from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy{
  private authSub: Subscription;
  private previousAuthState = false;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    SplashScreen.hide();
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if(!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });
    App.addListener('appStateChange', (state) => {
      this.checkAuthOnResume(state);
    })
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) this.authService.logout();
        });
    }
  }
}
