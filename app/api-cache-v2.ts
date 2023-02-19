import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { tap, mergeMap, map, startWith, catchError, share, filter, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

// posible states of the api request
export enum ApiStateType {
  Fetching,
  Success,
  Failure
}

// wrapper for the api status messages
export interface ApiStatus<T> {
  state: ApiStateType;
  key: string;
  params: any[];
  data: T;
}

export function generateCachedApi<T>(
  api: (...params) => Observable<T>,
  generateKey: (...params) => string
): (...params) => Observable<ApiStatus<T>> {
  const trigger = new Subject<any[]>();
  const stateCache = new Map<string, ApiStatus<T>>();
  const stream = trigger.pipe(
    map<any[], [any[], string]>((params) => [ params, generateKey(...params) ]),
    tap(([_, key]) => {
      if (!stateCache.has(key)) {
        stateCache.set(key, <ApiStatus<T>> {})
      }
    }),
    mergeMap(([params, key]) => {
      const apiStatus = stateCache.get(key);
      if (apiStatus.state === ApiStateType.Fetching || apiStatus.state === ApiStateType.Success) {
        return of(apiStatus);
      }
      return api(...params).pipe(
        map((data) => (<ApiStatus<T>>{ state: ApiStateType.Success, key, params, data })),
        catchError((data, source) => of(<ApiStatus<T>>{ state: ApiStateType.Failure, key, params, data })),
        startWith(<ApiStatus<T>>{ state: ApiStateType.Fetching, key, params }),
        tap(state => { stateCache.set(key, state); })
      )
    }),
    tap(x => { console.log('PUBLISH', x)}),
    share()
  );

  return (...params): Observable<ApiStatus<T>> => {
    const key = generateKey(...params);
    const instanceStream = stream.pipe(
      filter((response) => response.key === key),
      distinctUntilChanged()
    );
    setTimeout(() => { trigger.next(params); });
    return instanceStream;
  }
}