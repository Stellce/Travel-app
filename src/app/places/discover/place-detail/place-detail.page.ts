import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ActionSheetController, ModalController, NavController} from "@ionic/angular";
import {Place} from "../../place.model";
import {PlacesService} from "../../places.service";
import {CreateBookingComponent} from "../../../bookings/create-booking/create-booking.component";

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place: Place;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheerCtrl: ActionSheetController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')) return this.navCtrl.navigateBack('/places/offers');
      this.place = this.placesService.getPlace( paramMap.get('placeId'));
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
            console.log('BOOKED');
          }
      });
  }
}
