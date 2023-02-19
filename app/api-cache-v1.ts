import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { tap, switchMap, map, startWith, catchError, shareReplay, filter } from 'rxjs/operators';
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
  params: any[];
  data: T;
}

// information related to a stream for a unique set of parameters
interface StreamConfig<T> {
  state: ApiStateType;
  trigger: Subject<void>;
  stream: Observable<ApiStatus<T>>;
}

export function generateCachedApi<T>(
  api: (...params) => Observable<T>,
  generateKey: (...params) => string
): (...params) => Observable<ApiStatus<T>> {
  const cache = new Map<string, StreamConfig<T>>();

  return (...params): Observable<ApiStatus<T>> => {
    const key = generateKey(...params);
    let config = cache.get(key);

    if (!config) {
      console.log(`created new stream (${key})`);
      config = <StreamConfig<T>> { trigger: new Subject<void>() };
      config.stream = config.trigger.pipe(
        filter(() => config.state == null || config.state === ApiStateType.Failure),
        switchMap(() => {
          return api(...params).pipe(
            map((data) => (<ApiStatus<T>>{ state: ApiStateType.Success, params, data })),
            catchError((data, source) => of(<ApiStatus<T>>{ state: ApiStateType.Failure, params, data })),
            startWith(<ApiStatus<T>>{ state: ApiStateType.Fetching, params }),
            tap(x => { config.state = x.state; })
          );
        }),
        tap(x => { console.log('PUBLISH', x)}),
        shareReplay(1),
      );
      cache.set(key, config);
    } else {
      console.log(`returned existing stream (${key})`);
    }
    setTimeout(() => { config.trigger.next() });
    return config.stream;
  }
}