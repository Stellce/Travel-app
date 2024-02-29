import { Injectable } from '@angular/core';
import {Booking} from "./booking.model";
import {BehaviorSubject, delay, switchMap, take, tap} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {PlacesService} from "../places/places.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private backendUrl = environment.backendUrl;
  private _bookings = new BehaviorSubject<Booking[]>([]);
  private generatedId: string;
  get bookings() {
    return this._bookings.asObservable();
  }
  constructor(
    private authService: AuthService,
    private placesService: PlacesService,
    private http: HttpClient
  ) { }

  addBooking(newBooking: Booking) {
    newBooking = {...newBooking, id: Math.random().toString()};
    this.placesService.updatePlaceUserIdByPlaceId(newBooking.placeId);
    return this.http.post<{name: string}>(
      `${this.backendUrl}/bookings.json`,
      {...newBooking, id: null}
    ).pipe(
      switchMap(resData => {
        this.generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = this.generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    )
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  }

}
