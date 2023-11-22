import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { map } from 'rxjs';

export enum LayoutWidth {
  Narrow = 'Narrow',
  Wide = 'Wide',
}

@Injectable()
export class LayoutService {

  readonly #breakpoints = inject(BreakpointObserver);

  readonly screenWidth$ = this.#breakpoints.observe(Breakpoints.XSmall).pipe(
    map(({ matches }) => matches ? LayoutWidth.Narrow : LayoutWidth.Wide),
  );
}
