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
import { LoadingComponent } from './components/utils/loading/loading.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { AddContactComponent } from './components/main/add-contact/add-contact.component';
import {NgxPaginationModule} from "ngx-pagination";
import {ToastrModule} from "ngx-toastr";
import { ContactRequestsComponent } from './components/main/contact-requests/contact-requests.component';
import {PusherService} from "./services/pusher.service";
import { IncomingCallComponent } from './components/main/incoming-call/incoming-call.component';
import { SettingsComponent } from './components/main/navbar/settings/settings.component';
import {HomeComponent} from "./components/main/video-chat/home/home.component";
import {ChatComponent} from "./components/main/video-chat/chat/chat.component";
import {CallComponent} from "./components/main/video-chat/call/call.component";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    MainComponent,
    LoadingComponent,
    HomeComponent,
    ChatComponent,
    AddContactComponent,
    ContactRequestsComponent,
    CallComponent,
    IncomingCallComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgOptimizedImage,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    ToastrModule.forRoot({
      closeButton: true,
      progressBar: true,
      tapToDismiss: false,
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
    })
  ],
  providers: [PusherService],
  bootstrap: [AppComponent]
})
export class AppModule { }
