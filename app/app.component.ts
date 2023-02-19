import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { scan, startWith } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  public ids$ = new BehaviorSubject<number[]>([]);

  public add(id: number, force: boolean = false): void {
    this.ids$.next([...this.ids$.value, id]);
  }
}
