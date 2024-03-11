import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActionSheetController, AlertController, ModalController} from "@ionic/angular";
import {MapModalComponent} from "../../map-modal/map-modal.component";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {map, of, switchMap} from "rxjs";
import {Coordinates, PlaceLocation} from "../../../places/location.model";
import {Geolocation} from "@capacitor/geolocation";

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  apiKey = environment.apiKey;
  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheerCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }

  onPickLocation() {
    this.actionSheerCtrl.create({
      header: 'Please choose',
      buttons: [
        {text: 'Auto-Locate', handler: () => {
          this.locateUser();
        }},
        {text: 'Pick on map', handler: () => {
          this.openMap();
        }},
        {text: 'Cancel', role: "cancel"},
      ]
    }).then(actionSheet => {
      actionSheet.present();
    });

  }

  private async locateUser() {
    await Geolocation.getCurrentPosition().then(position => {
     const coordinates: Coordinates = {
       lng: position.coords.longitude,
       lat: position.coords.latitude
     };
     this.createPlace(coordinates);
      console.log('Current position:', coordinates);
    });
  }

  private showErrorAlert() {
    this.alertCtrl.create({
      header: 'Could not fetch location',
      message: 'Please use the map to pick a location!',
      buttons: ['Okay']
    }).then(alertEl => alertEl.present());
  }

  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if(!modalData?.data) return;
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        }
        this.createPlace(coordinates);
      });
      modalEl.present();
    });
  }

  private createPlace(coordinates: Coordinates) {
    const pickedLocation: PlaceLocation = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      address: null,
      staticMapImageUrl: null
    }
    this.getAddress(coordinates.lat, coordinates.lng).pipe(switchMap(address => {
      pickedLocation.address = address;
      return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
    })).subscribe(staticMapImageUrl => {
      pickedLocation.staticMapImageUrl = staticMapImageUrl;
      this.selectedLocationImage = staticMapImageUrl;
      this.locationPick.emit(pickedLocation);
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
          environment.apiKey
        }`
      )
      .pipe(
        map(geoData => {
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.apiKey}`;
  }

}
