import {Component, OnDestroy, OnInit} from '@angular/core';
import {Place} from "../place.model";
import {PlacesService} from "../places.service";
import {IonItemSliding} from "@ionic/angular";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  private placeSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.placeSub = this.placesService.places.subscribe(places => {
      this.offers = places;
    })
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'offers', 'edit', offerId]);
    console.log('Offer id: ', offerId);
  }

  ngOnDestroy() {
    if(this.placeSub) this.placeSub.unsubscribe();
  }

}
