import { Injectable } from '@angular/core';
import {Booking} from "./booking.model";
import {BehaviorSubject, delay, take, tap} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {PlacesService} from "../places/places.service";

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);
  get bookings() {
    return this._bookings.asObservable();
  }
  constructor(
    private authService: AuthService,
    private placesService: PlacesService
  ) { }

  addBooking(newBooking: Booking) {
    newBooking = {...newBooking, id: Math.random().toString()};
    this.placesService.updatePlaceUserIdByPlaceId(newBooking.placeId);
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.concat(newBooking));
      })
    );
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
