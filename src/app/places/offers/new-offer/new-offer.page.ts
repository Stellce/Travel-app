import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PlacesService} from "../../places.service";
import {Router} from "@angular/router";
import {LoadingController} from "@ionic/angular";
import {PlaceLocation} from "../../location.model";

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, {validators: [Validators.required]
      })
    });
  }
  onCreateOffer() {
    if(this.form.invalid) return;
    this.loadingCtrl.create({
      message: 'Creating place...'
    }).then(loadingEl => {
      loadingEl.present();
      let newPlace = this.form.value;
      this.placesService.addPlace(
        newPlace.title,
        newPlace.description,
        +newPlace.price,
        new Date(newPlace.dateFrom),
        new Date(newPlace.dateTo),
        this.form.value.location
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/', 'places', 'offers']);
      });
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({location: location});
  }
}
