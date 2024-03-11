import {NgModule} from "@angular/core";
import {LocationPickerComponent} from "./pickers/location-picker/location-picker.component";
import {MapModalComponent} from "./map-modal/map-modal.component";
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {GoogleMapsModule} from "@angular/google-maps";
import {ImagePickerComponent} from "./pickers/image-picker/image-picker.component";

@NgModule({
  declarations: [LocationPickerComponent, MapModalComponent, ImagePickerComponent],
  imports: [CommonModule, IonicModule, GoogleMapsModule],
  exports: [LocationPickerComponent, MapModalComponent, ImagePickerComponent],
})
export class SharedModule {}
