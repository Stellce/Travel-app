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
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if(!userId) throw new Error('No user id found!');
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newBooking = {
          ...newBooking,
          id: null,
          userId: fetchedUserId
        };
        // this.placesService.updatePlaceUserIdByPlaceId(newBooking.placeId);
        return this.http.post<{name: string}>(
          `${this.backendUrl}/bookings.json?auth=${token}`,
          newBooking
        )
      }),
      switchMap(resData => {
        this.generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = this.generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(`${this.backendUrl}/bookings/${bookingId}.json?auth=${token}`);
      }),
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
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if(!userId) throw new Error('User not found!');
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http.get<{[key: string]: BookingResponse}>(
          `${this.backendUrl}/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}&auth=${token}"`
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
