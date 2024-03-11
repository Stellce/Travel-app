import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {environment} from "../../../environments/environment";
import {Loader} from '@googlemaps/js-api-loader'
@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElementRef: ElementRef;
  @Input() center = { lat: -34.397, lng: 150.644 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick location';
  private apiKey = environment.apiKey;
  private clickListener: any;
  private googleMaps: any;
  private map: google.maps.Map;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps()
      .then(googleMaps => {
        this.googleMaps = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: this.center,
          zoom: 16
        });

        googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });

        if(this.selectable) {
          this.clickListener = map.event.addListener('click', event => {
            const selectedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            this.modalCtrl.dismiss(selectedCoords);
          });
        } else {
          const marker = new googleMaps.Marker({
            position: this.center,
            map: map,
            title: 'Picked location'
          });
          marker.setMap(map);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  onCancel() {
   this.modalCtrl.dismiss();
  }

  private async getGoogleMaps(): Promise<any> {
    const loader = new Loader({apiKey: this.apiKey})
    loader.load().then(() => {
      const map = displayMap();
    })

    function displayMap() {
      const mapOptions = {
        center: { lat: -33.860664, lng: 151.208138 },
        zoom: 14
      };
      const mapEl = document.createElement("div");
      mapEl.setAttribute("id", "map");
      const map = new google.maps.Map(mapEl, mapOptions);
      return map;
    }


    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    this.map = new Map(document.getElementById("map") as HTMLElement, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });
  }

  ngOnDestroy() {
    this.googleMaps.event.removeListener(this.clickListener);
  }

}
