export class User {
  constructor(
    public id: string,
    public email: string,
    public _token: string,
    public tokenExpirationDate: Date
  ) {}

  get token() {
    if(!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null;
    }
    return this._token;
  }
}
