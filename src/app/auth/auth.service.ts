import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {AuthResponseData} from "./authResponseData.model";
import {BehaviorSubject, from, map, tap} from "rxjs";
import {User} from "./user.model";
import {Preferences} from '@capacitor/preferences';
import {AuthData} from "./auth-data.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy{
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;
  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
      if(user) {
        return !!user.token;
      } else {
        return false;
      }
    }));
  }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if(user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }

  constructor(
    private http: HttpClient
  ) { }

  autoLogin() {
    return from(Preferences.get({key: 'authData'})).pipe(map(storedData => {
      if(!storedData || !storedData.value) return;
      const parsedData = JSON.parse(storedData.value) as AuthData;
      const expirationTime = new Date(parsedData.tokenExpirationDate);
      if (expirationTime <= new Date()) return;
      const user = new User(
        parsedData.userId,
        parsedData.email,
        parsedData.token,
        expirationTime
      )
      return user;
    }),
      tap(user => {
        if(user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      }));
  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`,
      {email: email, password: password, returnSecureToken: true})
      .pipe(tap(this.setUserData.bind(this)));
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`,
      {email: email, password: password, returnSecureToken: true})
      .pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Preferences.remove({key: 'authData'});
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration)
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + (+userData.expiresIn * 1000)
    );
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    const authData: AuthData = {
      userId: userData.localId,
      email: userData.email,
      token: userData.idToken,
      tokenExpirationDate: expirationTime.toISOString()
    }
    this.storeAuthData(authData);
  }

  private storeAuthData(authData: AuthData) {
    Preferences.set({
      key: 'authData',
      value:  JSON.stringify(authData),
    })
  }
}
