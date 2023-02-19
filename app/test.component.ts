import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { tap, filter } from 'rxjs/operators';

import { ApiService } from './api.service';

@Component({
  selector: 'my-test',
  template: '<div>[{{index}}] {{ response | async | json }}</div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent implements OnInit {
  @Input()
  public id: string;
  @Input()
  public index: string;

  public response: Observable<any>;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.response = this.api.getById(this.id).pipe(
      tap(x => { console.log(`[${this.index}]`, x); })
    );
  }
}
