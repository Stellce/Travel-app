import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
import {SegmentChangeEventDetail} from "@ionic/angular";
import {Subscription, take} from "rxjs";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
  private filter: string = 'all';
  private placesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.onFilterUpdate(this.filter);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onFilterUpdate(filter: string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      const isShown = (place: Place) =>
        filter === 'all' || place.userId !== userId;
      this.relevantPlaces = this.loadedPlaces.filter(isShown);
      this.filter = filter;
    });
  }

  ngOnDestroy() {
    if(this.placesSub) this.placesSub.unsubscribe();
  }

}
