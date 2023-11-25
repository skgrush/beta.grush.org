import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { LayoutService } from './shared/services/layout.service';
import { TitleStrategyService } from './shared/services/title-strategy.service';
import { provideHttpClient } from '@angular/common/http';
import { APP_BASE_HREF, Location as NgLocation } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
    ),
    provideHttpClient(),
    {
      provide: TitleStrategy,
      useClass: TitleStrategyService,
    },
    NgLocation,
    {
      provide: APP_BASE_HREF,
      useValue: '/',
    },
    provideClientHydration(),
    provideAnimations(),
    LayoutService,
    importProvidersFrom(
      LayoutModule,
    ),
  ]
};
