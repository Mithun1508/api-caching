import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { delay, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';

import { generateCachedApi } from './api-cache-v2';

@Injectable()
export class ApiService {
  /*public getByIdInvoke = new ReplaySubject<string>();
  public getById = this.getByIdInvoke.pipe(
    cacheMap((id: string) => this.fakeApiCall(id), (id) => id)
  );*/
  private callCount = new Map<string, number>();

  public getById = generateCachedApi(
    (id: string) => this.fakeApiCall(`single|${id}`),
    (id: string) => id
  );

  public getAll = generateCachedApi(
    () => this.fakeApiCall('all'),
    () => 'highlander'
  );

  constructor() {
  }

  private fakeApiCall(key: string) {
    let count = this.callCount.get(key);
    let result: Observable<string>;
    if (count == null) {
      count = 0;
      this.callCount.set(key, count);
      result = _throw(key);
    } else {
      result = of(key);
    }
    count++;
    return result.pipe(delay(1000 + Math.random() * 1000));
  }
}