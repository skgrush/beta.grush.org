import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class TitleStrategyService extends TitleStrategy {

  readonly #appTitle = 'Grush.org';

  readonly #titleService = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);

    const title = routeTitle
      ? `${routeTitle} - ${this.#appTitle}`
      : this.#appTitle;

    this.#titleService.setTitle(title);
  }
}
