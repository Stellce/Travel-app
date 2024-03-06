import { Injectable } from '@angular/core';
import {Place} from "./place.model";
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, delay, map, of, switchMap, take, tap, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {PlaceResponse} from "./place-response.model";
import {environment} from "../../environments/environment";
import {PlaceLocation} from "./location.model";

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private backendUrl = environment.backendUrl;
  private _places = new BehaviorSubject<Place[]>([]);
  private _offers = new BehaviorSubject<Place[]>([
    // new Place(
    //   'p3',
    //   'Manhattan Mansion',
    //   'In the heart of New York City',
    //   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
    //   149,
    //   new Date('2024-01-01'),
    //   new Date('2024-12-31'),
    //   'abc'
    // ),
    // new Place(
    //   'p3',
    //   'Manhattan Mansion',
    //   'In the heart of New York City',
    //   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
    //   149,
    //   new Date('2024-01-01'),
    //   new Date('2024-12-31'),
    //   'abc'
    // ),
    // new Place(
    //   'p3',
    //   'Manhattan Mansion',
    //   'In the heart of New York City',
    //   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
    //   149,
    //   new Date('2024-01-01'),
    //   new Date('2024-12-31'),
    //   'abc'
    // ),
  ]);
  testSub = new BehaviorSubject(123);
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}
  get places() {
    return this._places.asObservable();
  }

  get offers() {
    return this._offers.asObservable();
  }

  fetchPlaces() {
    return this.http
      .get<{[key: string]: PlaceResponse}>(`${this.backendUrl}/offered-places.json`)
      .pipe(map(resData => {
        const places = [];
        for (const key in resData) {
          places.push(
            new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId,
              resData[key].location
            )
          )
        }
        return places;
      }),
        tap(places => {
          this._places.next(places);
        }));
  }

  getPlace(id: string) {
    return this.http.get<PlaceResponse>(`${this.backendUrl}/offered-places/${id}.json`).pipe(
      map(placeResponse => {
        return new Place(
          id,
          placeResponse.title,
          placeResponse.description,
          placeResponse.imageUrl,
          placeResponse.price,
          new Date(placeResponse.availableFrom),
          new Date(placeResponse.availableTo),
          placeResponse.userId,
          placeResponse.location
        );
      })
    )
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation) {
    let generatedId: string;
    const newPlace =
      new Place(
        Math.random().toString(),
        title,
        description,
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/288px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
        price,
        dateFrom,
        dateTo,
        this.authService.userId,
        location
        );
    return this.http
      .post<{name: string}>(`${this.backendUrl}/offered-places.json`, {...newPlace, id: null})
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if(!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(place => place.id === placeId)
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
          `${this.backendUrl}/offered-places/${placeId}.json`,
          {...updatedPlaces[updatedPlaceIndex], id: null}
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

  updatePlaceUserIdByPlaceId(placeId: string) {
    this.places.pipe(take(1)).subscribe(places => {
      places.find(p => p.id === placeId).userId = this.authService.userId;
      this._places.next(places);
    })
  }

}
