import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';          // ⬅️ AÑADIR

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: LocationStrategy, useClass: HashLocationStrategy }, // hash routing ✅
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),                                           // ⬅️ AÑADIR
  ]
};
