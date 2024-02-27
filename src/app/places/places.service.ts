import { Injectable } from '@angular/core';
import {Place} from "./place.model";
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, map, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
      149,
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      'abc'
    ),
    new Place(
      'p2',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
      149,
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
      149,
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      'abc'
    ),
 ]);
  private _offers = new BehaviorSubject<Place[]>([
    new Place(
      'p3',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
      149,
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
      149,
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
      149,
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      'abc'
    ),
  ]);
  constructor(private authService: AuthService) {}
  get places() {
    return this._places.asObservable();
  }

  get offers() {
    return this._offers.asObservable();
  }

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map(places => {
        return {...places.find(p => p.id === id)}
      })
    );
  }

  addPlace(title: string, decription: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace =
      new Place(
        Math.random().toString(),
        title,
        decription,
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
        price,
        dateFrom,
        dateTo,
        this.authService.userId
        );
    this.places.pipe(take(1)).subscribe(places => {
      this._places.next(places.concat(newPlace));
    })
  }
}
