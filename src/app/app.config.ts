import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { LayoutService } from './shared/services/layout.service';
import { TitleStrategyService } from './shared/services/title-strategy.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
    ),
    {
      provide: TitleStrategy,
      useClass: TitleStrategyService,
    },
    provideClientHydration(),
    provideAnimations(),
    LayoutService,
    importProvidersFrom(
      LayoutModule,
    ),
  ]
};
