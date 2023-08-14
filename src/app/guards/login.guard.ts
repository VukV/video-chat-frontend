import {CanActivateFn, Router} from '@angular/router';
import {CurrentUserService} from "../services/current-user.service";
import {inject} from "@angular/core";

export const loginGuard: CanActivateFn = (route, state) => {
  const currentUserService: CurrentUserService = inject(CurrentUserService);
  const router: Router = inject(Router);

  let token = currentUserService.getToken();
  //todo verify token

  return true;
};
