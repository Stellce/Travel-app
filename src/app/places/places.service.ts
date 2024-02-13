import { Injectable } from '@angular/core';
import {Place} from "./place.model";

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place('p1', 'Manhattan Mansion', 'In the heart of New York City', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg', 149),
    new Place('p1', 'Manhattan Mansion', 'In the heart of New York City', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg', 149),
    new Place('p1', 'Manhattan Mansion', 'In the heart of New York City', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg', 149),
  ];
  get places() {
    return [...this._places];
  }

  constructor() { }
}
