import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, Location as NgLocation } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, defer, map, of, shareReplay } from 'rxjs';
import { MatCardModule } from '@angular/material/card';

type IError = {
  readonly path: string;
  readonly message: string;
  readonly details: string | null;
};

@Component({
  selector: 'grush-error',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent {

  readonly #http = inject(HttpClient);
  readonly #location = inject(NgLocation);

  error$: Observable<IError> = defer(() => {
    const path = this.#location.path();
    console.info('location', this.#location, 'path', path);

    if (path === '/error') {
      return of({
        path,
        message: 'This is the error page',
        details: null,
      });
    }


    return this.#http.head(
      path,
      { observe: 'response' },
    ).pipe(
      map((resp): IError => {
        console.info('response', resp);
        const result = this.#handleAmazonError(resp);
        // it's an Amazon error
        if (result !== null) {
          return {
            path,
            ...result,
          };
        }
        // not an Amazon error, but is an error?
        if (resp.status >= 400) {
          return {
            path,
            message: resp.statusText,
            details: null,
          };
        }

        // fallback when weird shit happens
        return {
          path,
          message: 'An unknown error occurred',
          details: `We're not on the error page, but we didn't see any error information from the request...`,
        };
      }),
    )
  }).pipe(
    shareReplay({ refCount: true, bufferSize: 1 }),
  );


  #handleAmazonError(resp: HttpResponse<any>): null | Omit<IError, 'path'> {

    const amazonHeaders = this.#getAllHeadersAndRemovePrefix(resp, 'x-amz-');
    const {
      'error-code': errorCode,
      'error-message': errorMessage,
      'error-detail-key': errorDetailKey,
    } = amazonHeaders;
    const path = resp.url;

    if (!errorCode) {
      return null;
    }

    if (errorCode === 'NoSuchKey') {
      return {
        message: errorMessage ?? errorCode,
        details: errorDetailKey ?? null,
      };
    }

    // fallback for unknown error

    const keys = resp.headers.keys();
    const allHeaders = this.#getAllHeadersAndRemovePrefix(resp, '');
    return {
      message: `${errorCode}: ${errorMessage}`,
      details: JSON.stringify(allHeaders, undefined, 2),
    };
  }

  #getAllHeadersAndRemovePrefix(resp: HttpResponse<any>, prefix: string): Partial<Record<string, string>> {
    const filteredKeys = resp.headers.keys().filter(k => k.startsWith(prefix));
    const prefixLen = prefix.length;

    const filteredHeaders = Object.fromEntries(
      filteredKeys.map(k => [
        k.slice(prefixLen),
        resp.headers.get(k)!,
      ]),
    );
    return filteredHeaders;
  }
}

export default ErrorComponent;
