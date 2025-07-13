import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { importProvidersFrom } from '@angular/core';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { InMemoryDataService } from './services/in-memory-data.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(withFetch()),
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(
        InMemoryDataService, 
        { 
          dataEncapsulation: false,
          delay: 500, // Simulate network delay
          passThruUnknownUrl: true // Allow requests to pass through if not in the in-memory database
        }
      )
    ),
    provideClientHydration(withEventReplay()), 
    provideAnimationsAsync()
  ]
};