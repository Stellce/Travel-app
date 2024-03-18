import { Injectable } from '@angular/core';
import {Booking} from "./booking.model";
import {BehaviorSubject, map, switchMap, take, tap} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {PlacesService} from "../places/places.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BookingResponse} from "./booking-response.model";

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
  ) {}

  addBooking(newBooking: Booking) {
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if(!userId) throw new Error('No user id found!');
      newBooking = {
        ...newBooking,
        id: null,
        userId: userId
      };
      // this.placesService.updatePlaceUserIdByPlaceId(newBooking.placeId);
      return this.http.post<{name: string}>(
        `${this.backendUrl}/bookings.json`,
        newBooking
      )
    }), switchMap(resData => {
      this.generatedId = resData.name;
      return this.bookings;
    }),
      take(1),
      tap(bookings => {
        newBooking.id = this.generatedId;
        this._bookings.next(bookings.concat(newBooking));
      }));
  }

  cancelBooking(bookingId: string) {
    return this.http.delete(`${this.backendUrl}/bookings/${bookingId}.json`).pipe(
      switchMap(() => {
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  }

  fetchBookings() {
    return this.authService.userId.pipe(switchMap(userId => {
      if(!userId) throw new Error('User not found!');
      return this.http.get<{[key: string]: BookingResponse}>(
        `${this.backendUrl}/bookings.json?orderBy="userId"&equalTo="${userId}"`
      )
    }),
      map(bookingData => {
        const bookings = [];
        for (const key in bookingData) {
          let newBooking: Booking = {
            id: key,
            placeId: bookingData[key].placeId,
            userId: null,
            placeTitle: bookingData[key].placeTitle,
            placeImage: bookingData[key].placeImage,
            firstName: bookingData[key].firstName,
            lastName: bookingData[key].lastName,
            guestNumber: +bookingData[key].guestNumber,
            bookedFrom: new Date(bookingData[key].bookedFrom),
            bookedTo: new Date(bookingData[key].bookedTo)
          }
          bookings.push(newBooking);
        }
        return bookings;
      }), tap(bookings => {
        this._bookings.next(bookings);
      })
    );
  }
}
