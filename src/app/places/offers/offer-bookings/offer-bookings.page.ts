import {Component, OnDestroy, OnInit} from '@angular/core';
import {Place} from "../../place.model";
import {ActivatedRoute} from "@angular/router";
import {NavController} from "@ionic/angular";
import {PlacesService} from "../../places.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: Place;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')) return this.navCtrl.navigateBack('/places/offers');
      this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place =>
        this.place = place
      );
    });
  }

  ngOnDestroy() {
    this.placeSub?.unsubscribe();
  }
}
