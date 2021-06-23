import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from "@angular/router";
import { Observable } from "rxjs";
import { GeneralService } from "src/app/services/general.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate, CanLoad {
  token;
  constructor(private generalservice: GeneralService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let token = this.generalservice.getSavedToken();
    if ( !token) {
      this.router.navigate(["/login"]);
      return false;
    } else {
      return true;
    }
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    let token = this.generalservice.getSavedToken();
    if (token) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
