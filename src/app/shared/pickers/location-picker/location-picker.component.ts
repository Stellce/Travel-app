import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";
import {MapModalComponent} from "../../map-modal/map-modal.component";

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent  implements OnInit {

  constructor(
    private modalCtr: ModalController
  ) { }

  ngOnInit() {}

  onPickLocation() {
    this.modalCtr.create({component: MapModalComponent}).then(modalEl => {
      modalEl.present();
    })
  }

}
