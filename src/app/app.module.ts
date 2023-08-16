import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { NavbarComponent } from './components/main/navbar/navbar.component';
import {NgOptimizedImage} from "@angular/common";
import { LoginComponent } from './components/login/login.component';
import {FormsModule} from "@angular/forms";
import { MainComponent } from './components/main/main.component';
import {HttpClientModule} from "@angular/common/http";
import {NgxSpinnerModule} from "ngx-spinner";
import { LoadingComponent } from './components/loading/loading.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {LottieModule} from "ngx-lottie";
import player from 'lottie-web';
import { HomeComponent } from './components/main/chat/home/home.component';
import { ChatComponent } from './components/main/chat/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    MainComponent,
    LoadingComponent,
    HomeComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgOptimizedImage,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    LottieModule.forRoot({player: playerFactory})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function playerFactory() {
  return player;
}
