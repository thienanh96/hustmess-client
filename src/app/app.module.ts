import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule, Routes, RouteReuseStrategy } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule, RequestOptions, Http } from "@angular/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { MatButtonModule, MatCheckboxModule } from "@angular/material";
import { AuthenticationComponent } from "./components/authentication/authentication.component";
import { AuthenticationService } from "./services/authentication.service";
import { SocketService } from "./services/socket.service";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { HttpClientModule } from "@angular/common/http";
import { ContactsComponent } from "./components/contacts/contacts.component";
import { HomeComponent } from "./components/home/home.component";
import { RoomchatComponent } from "./components/roomchat/roomchat.component";
import { ConversationComponent } from "./components/conversation/conversation.component";
import { LastmessageComponent } from "./components/lastmessage/lastmessage.component";
import { ComponentCommunicationService } from "./services/component-communication.service";
import { SearchRoomchatPipe } from "./search-roomchat.pipe";
import { SearchContactsPipe } from "./search-contacts.pipe";
import { MessageComponent } from "./components/message/message.component";
import { TextareaAutosizeModule } from "ngx-textarea-autosize";

import { TimeAgoPipe } from "./time-ago.pipe";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { InputComponent } from "./components//input/input.component";
import { TimeagoPipe } from "./timeago.pipe";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { NewMessageComponent } from "./components/new-message/new-message.component";
import { CustomReuseStrategy } from "./CustomRouteReuseStategy";
import { ClickOutsideModule } from "ng4-click-outside";
import { InfoConversationComponent } from "./components/info-conversation/info-conversation.component";
import { ServicesComponent } from "./components/services/services.component";
import { AnswerComponent } from "./components/answer/answer.component";
import { AuthGuard } from "./guard/auth.guard";
import { ProfileComponent } from "./components/profile/profile.component";

const appRoutes: Routes = [
  // {path:'newfeeds', component: },
  { path: "authenticate", component: AuthenticationComponent },
  {
    path: "contacts",
    component: ContactsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { key: "homee" },
    children: [
      {
        path: "conversation/:roomchatid",
        component: ConversationComponent,
        canActivate: [AuthGuard],
        data: { key: "home-conversation" }
      },
      {
        path: "newmessage",
        component: NewMessageComponent,
        canActivate: [AuthGuard],
        data: { key: "home-newmessage" }
      }
    ]
  },
  {
    path: "conversation/:roomchatid",
    component: ConversationComponent,
    canActivate: [AuthGuard]
  },
  { path: "roomchats", component: RoomchatComponent, canActivate: [AuthGuard] },
  {
    path: "conversation/:roomchatid",
    component: ConversationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "infoconversation/:roomchatid",
    component: InfoConversationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "newmessage",
    component: NewMessageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "services/:id",
    component: ServicesComponent,
    canActivate: [AuthGuard]
  },
  { path: "answer/:id", component: AnswerComponent, canActivate: [AuthGuard] },
  { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] }
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
    SearchContactsPipe,
    MessageComponent,
    InputComponent,
    TimeAgoPipe,
    TimeagoPipe,
    NewMessageComponent,
    InfoConversationComponent,
    ServicesComponent,
    AnswerComponent,
    ProfileComponent
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
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: "never" }),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production
    })
  ],
  exports: [RouterModule],
  providers: [
    AuthenticationService,
    ComponentCommunicationService,
    // { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    SocketService,
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig(), http, options);
}
