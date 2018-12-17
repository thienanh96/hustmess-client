import {
  RouteReuseStrategy,
  DetachedRouteHandle,
  ActivatedRouteSnapshot
} from "@angular/router";
export class CustomReuseStrategy implements RouteReuseStrategy {
  routesToCache: string[] = ["home"];
  storedRouteHandles = new Map<string, DetachedRouteHandle>();

  // Decides if the route should be stored
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (!route.routeConfig) return false;
    return this.routesToCache.indexOf(route.routeConfig.path) > -1;
  }

  //Store the information for the route we're destructing
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.storedRouteHandles.set(route.routeConfig.path, handle);
  }

  //Return true if we have a stored route object for the next route
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRouteHandles.has(route.routeConfig.path);
  }

  //If we returned true in shouldAttach(), now return the actual route data for restoration
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig) return null;
    if (route.routeConfig.loadChildren) return null;
    return this.storedRouteHandles.get(route.routeConfig.path);
  }

  //Reuse the route if we're going to and from the same route
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    if (!future.routeConfig || !curr.routeConfig) return true;
    if (
      future.routeConfig.path.includes("conversation/:roomchatid") &&
      curr.routeConfig.path.includes("conversation/:roomchatid")
    ) {
      return false;
    }
    return future.routeConfig === curr.routeConfig;
  }
}
