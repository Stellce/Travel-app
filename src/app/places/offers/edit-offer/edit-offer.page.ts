import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, LoadingController, NavController} from "@ionic/angular";
import {Place} from "../../place.model";
import {PlacesService} from "../../places.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  form: FormGroup;
  isLoading = false;
  placeId: string;
  private placeSub: Subscription
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private router: Router,
    private loadingCtr: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')) return this.navCtrl.navigateBack('/places/offers');
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace( paramMap.get('placeId')).subscribe({
        next: place => {
          this.place = place;
          this.form = new FormGroup({
            title: new FormControl(this.place.title, {
              updateOn: 'blur',
              validators: [Validators.required]
            }),
            description: new FormControl(this.place.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)]
            }),
          });
          this.isLoading = false;
        },
        error: error => {
          console.log('ERROR OCCURED')
          console.log(error)
          this.alertCtrl.create({
            header: 'An error occured!',
            message: 'Place could not be fetched. Please try again later',
            buttons: [{
              text: 'Okay', handler: () => {
                this.router.navigate(['places/offers']);
              }
            }]
          }).then(alertEl => alertEl.present());
        }
      })
    })
  }

  onUpdatePlace() {
    if(this.form.invalid) return;
    this.loadingCtr.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.updatePlace(
        this.place.id,
        this.form.value.title,
        this.form.value.description
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/offers']);
      });
    })
  }

  ngOnDestroy() {
    if(this.placeSub) this.placeSub.unsubscribe();
  }

}
