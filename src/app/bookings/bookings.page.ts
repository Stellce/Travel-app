import {Component, OnDestroy, OnInit} from '@angular/core';
import {BookingService} from "./booking.service";
import {Booking} from "./booking.model";
import {IonItemSliding} from "@ionic/angular";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  private bookingsSub: Subscription;
  constructor(private bookingsService: BookingService) {}

  ngOnInit() {
    this.bookingsSub = this.bookingsService.bookings.subscribe(bookings =>
      this.loadedBookings = bookings);
  }

  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
  }

  ngOnDestroy() {
    this.bookingsSub?.unsubscribe();
  }

}
