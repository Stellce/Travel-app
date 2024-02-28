import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ActionSheetController, LoadingController, ModalController, NavController} from "@ionic/angular";
import {Place} from "../../place.model";
import {PlacesService} from "../../places.service";
import {CreateBookingComponent} from "../../../bookings/create-booking/create-booking.component";
import {Subscription} from "rxjs";
import {BookingService} from "../../../bookings/booking.service";

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private placeSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheerCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtr: LoadingController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')) return this.navCtrl.navigateBack('/places/offers');
      this.placeSub = this.placesService.getPlace( paramMap.get('placeId')).subscribe(place =>
        this.place = place
      );
    })
  }

  onBookPlace() {
    // this.navCtrl.navigateBack('/places/discover');
    this.actionSheerCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheet => {
      actionSheet.present();
    })

  }

  private openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: {selectedPlace: this.place, selectedMode: mode}
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then(resulData => {
        console.log(resulData.data)
          if(resulData.role === 'confirm') {
            this.loadingCtr
              .create({message: 'Booking place...'})
              .then(loadingEl => {
                loadingEl.present();
                const data = resulData.data.bookingData;
                this.bookingService.addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                ).subscribe(() => {
                  loadingEl.dismiss();
                })
              })
          }
      });
  }
  ngOnDestroy() {
    if(this.placeSub)this.placeSub.unsubscribe();
  }
}
