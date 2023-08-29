import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainComponent} from "./components/main/main.component";
import {LoginComponent} from "./components/login/login.component";
import {loginGuard} from "./guards/login.guard";
import {CallComponent} from "./components/main/video-chat/call/call.component";


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'call',
    component: CallComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
