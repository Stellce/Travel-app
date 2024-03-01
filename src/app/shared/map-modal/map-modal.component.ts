import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent  implements OnInit, AfterViewInit {
  private apiKey = environment.apiKey;

  constructor(
    private modalCtr: ModalController
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps().then(googleMaps => {

    }).catch(err => {
      console.log(err);
    })
  }

  onCancel() {
   this.modalCtr.dismiss();
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if(googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `"https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&loading=async&callback=initMap"`
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available');
        }
      }
    })
  }

}
