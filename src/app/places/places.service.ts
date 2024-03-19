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
  private _offers = new BehaviorSubject<Place[]>([]);
  private cloudSaveImageUrl = environment.cloudSaveImageUrl;
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
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http
        .get<{[key: string]: PlaceResponse}>(`${this.backendUrl}/offered-places.json?auth=${token}`);
    }),
    map(resData => {
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
      })
    );
  }

  getPlace(id: string) {
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http.get<PlaceResponse>(`${this.backendUrl}/offered-places/${id}.json?auth=${token}`)
    }),
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

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http.post<{imageUrl: string, imagePath: string}>(
        this.cloudSaveImageUrl,
        uploadData,
        {headers: {Authorization: 'Bearer ' + token}}
      );
    }));


  }

  addPlace(newPlace: Place) {
    let generatedId: string;
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
      if(!fetchedUserId) throw new Error('No user found');
      newPlace = {
        ...newPlace,
        id: Math.random().toString(),
        userId: fetchedUserId
      }
      return this.http
        .post<{name: string}>(
          `${this.backendUrl}/offered-places.json?auth=${token}`,
          {...newPlace, id: null}
        )
    }),
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
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
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
          `${this.backendUrl}/offered-places/${placeId}.json?auth=${fetchedToken}`,
          {...updatedPlaces[updatedPlaceIndex], id: null}
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

  // updatePlaceUserIdByPlaceId(placeId: string) {
  //   this.places.pipe(take(1)).subscribe(places => {
  //     places.find(p => p.id === placeId).userId = this.authService.user;
  //     this._places.next(places);
  //   })
  // }

}
