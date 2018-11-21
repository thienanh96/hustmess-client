import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, RequestOptions, Http } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { AuthenticationService } from './services/authentication.service';
import { SocketService } from './services/socket.service';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import {HttpClientModule } from '@angular/common/http';
import { ContactsComponent } from './components/contacts/contacts.component';
import { HomeComponent } from './components/home/home.component';
import { RoomchatComponent } from './components/roomchat/roomchat.component';
import { ConversationComponent } from './components/conversation/conversation.component';
import { LastmessageComponent } from './components/lastmessage/lastmessage.component';
import { ComponentCommunicationService } from './services/component-communication.service';
import { SearchRoomchatPipe } from './search-roomchat.pipe';
import { MessageComponent } from './components/message/message.component';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { TimeAgoPipe } from 'time-ago-pipe';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { InputComponent } from './components//input/input.component';
import { TimeagoPipe } from './timeago.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NewMessageComponent } from './components/new-message/new-message.component';
import { CustomReuseStrategy } from './CustomRouteReuseStategy';
import { ClickOutsideModule } from 'ng4-click-outside';
import { InfoConversationComponent } from './components/info-conversation/info-conversation.component';
import { ServicesComponent } from './components/services/services.component';
import { AnswerComponent } from './components/answer/answer.component';
const appRoutes: Routes = [
  // {path:'newfeeds', component: },
  { path: 'authenticate', component: AuthenticationComponent },
  { path: 'contacts', component: ContactsComponent },
  {
    path: 'home', component: HomeComponent,
    // data: { shouldReuse: true },
    children: [
      {
        path: 'conversation/:roomchatid',
        component: ConversationComponent
      },
      {
        path: 'newmessage',
        component: NewMessageComponent
      }
    ]
  },
  { path: 'roomchats', component: RoomchatComponent},
  { path: 'conversation/:roomchatid', component: ConversationComponent},
  { path: 'infoconversation/:roomchatid', component: InfoConversationComponent},
  { path: 'newmessage', component: NewMessageComponent},
  { path: 'services/:id', component: ServicesComponent},
  { path: 'answer/:id', component: AnswerComponent}
  // {
  //   path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard],children: [{ path: 'post/:postID', component: PostComponent }]
  // }
  // { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard]},
];


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AuthenticationComponent,
    ContactsComponent,
    HomeComponent,
    RoomchatComponent,
    ConversationComponent,
    LastmessageComponent,
    SearchRoomchatPipe,
    MessageComponent,
    InputComponent,
    TimeAgoPipe,
    TimeagoPipe,
    NewMessageComponent,
    InfoConversationComponent,
    ServicesComponent,
    AnswerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    TextareaAutosizeModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    RouterModule.forRoot(appRoutes),
    HttpModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  exports: [
    RouterModule
  ],
  providers: [AuthenticationService,
    ComponentCommunicationService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    SocketService,
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }],
  bootstrap: [AppComponent]
})




export class AppModule { }

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig(), http, options);
}

