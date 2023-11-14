import { Injectable, inject } from '@angular/core';
import { Route, RouteConfigLoadEnd, Router, Routes } from '@angular/router';
import { filter, map, startWith } from 'rxjs';


export interface IRouteTreeNode {
  readonly path: string[];
  readonly name: string;
  readonly icon?: string;
  readonly children: IRouteTreeNode[] | null;
}

interface IExpectedRoute {
  path?: string;
  data?: {
    name?: string;
    hidden?: boolean;
    icon?: string;
  };
  children?: IExpectedRoute[];
}

@Injectable()
export class SidebarService {

  readonly #router = inject(Router);

  public readonly routes$ = this.#router.events.pipe(
    filter((e): e is RouteConfigLoadEnd => e instanceof RouteConfigLoadEnd),
    startWith(null),
    map(() => this.#router.config),
    map(routes => this.#parseChildren([], routes)),
  );

  #parseRoute(parentPath: string[], route: IExpectedRoute): IRouteTreeNode | null {
    if (route.data?.['hidden'] || route.path === '**' || route.path === undefined) {
      return null;
    }

    const path = [...parentPath, route.path];

    return {
      path,
      name: route.data?.['name'] ?? route.path ?? '??',
      icon: route.data?.['icon'],
      children: this.#parseChildren(path, route.children),
    };
  }

  #parseChildren(parentPath: string[], routes?: IExpectedRoute[]): IRouteTreeNode[] | null {
    const nodes = routes
      ?.map(route => this.#parseRoute(parentPath, route))
      .filter((route): route is IRouteTreeNode => !!route);

    if (!nodes?.length) {
      return null;
    }
    return nodes;
  }
}
