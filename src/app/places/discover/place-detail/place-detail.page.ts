import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController
} from "@ionic/angular";
import {Place} from "../../place.model";
import {PlacesService} from "../../places.service";
import {CreateBookingComponent} from "../../../bookings/create-booking/create-booking.component";
import {Subscription, switchMap, take} from "rxjs";
import {BookingService} from "../../../bookings/booking.service";
import {AuthService} from "../../../auth/auth.service";
import {Booking} from "../../../bookings/booking.model";
import {MapModalComponent} from "../../../shared/map-modal/map-modal.component";

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheerCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtr: LoadingController,
    private authService: AuthService,
    private alertCtl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId'))
        return this.navCtrl.navigateBack('/places/offers');

      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId
        .pipe(
          take(1),
          switchMap(userId => {
            if(!userId) throw new Error('Found no user!');
            fetchedUserId = userId;
            return this.placesService
              .getPlace(paramMap.get('placeId'))
          })).subscribe({
            next: place => {
            this.place = place;
            this.isBookable = place.userId !== fetchedUserId;
            this.isLoading = false;
            },
            error: () => {
              this.alertCtl.create({
                header: 'An error occured!',
                message: 'Could not load place',
                buttons: [{text: 'Okay', handler: () => {
                  this.router.navigate(['/places/discover']);
                }}]
              }).then(alertEl => alertEl.present());
            }
          });
    })
  }

  onBookPlace() {
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
        if(resulData.role === 'confirm') {
          this.loadingCtr
            .create({message: 'Booking place...'})
            .then(loadingEl => {
              loadingEl.present();
              const data = resulData.data.bookingData;
              const newBooking: Booking = {
                id: null,
                placeId: this.place.id,
                userId: null,
                placeTitle: this.place.title,
                placeImage: this.place.imageUrl,
                firstName: data.firstName,
                lastName: data.lastName,
                guestNumber: data.guestNumber,
                bookedFrom: data.startDate,
                bookedTo: data.endDate
              }
              this.bookingService.addBooking(newBooking).subscribe(() => {
                loadingEl.dismiss();
                this.navCtrl.navigateBack('/places/discover');
              })
            })
        }
      });
  }

  onShowFullMap() {
    this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        center: {
          lat: this.place.location.lat,
          lng: this.place.location.lng
        },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location?.address
      }
    }).then(modalEl => {
      modalEl.present();
    });
  }
  ngOnDestroy() {
    if(this.placeSub)this.placeSub.unsubscribe();
  }
}
