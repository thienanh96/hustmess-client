import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AuthenticationService } from "../../services/authentication.service";
import {
  FormControl,
  Validators,
  AsyncValidator,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormGroup
} from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subject, ReplaySubject, from, of, range } from "rxjs";
import { map, filter, switchMap, catchError } from "rxjs/operators";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
const PHONENUMBER_REGEX = /(0[3|5|7|8|9])+([0-9]{8})\b/;
@Component({
  selector: "app-authentication",
  templateUrl: "./authentication.component.html",
  styleUrls: ["./authentication.component.css"]
})
export class AuthenticationComponent implements OnInit {
  login: any = {
    username: "",
    password: ""
  };
  register: any = {
    username: "",
    password: "",
    email: ""
  };
  switchToLoginUI: boolean = true;
  switchToRegisterUI: boolean = false;
  registerForm: FormGroup;
  loading: Boolean = false;
  // emailFormControl = new FormControl('', [Validators.required, Validators.pattern(EMAIL_REGEX)], this.usernameValidator());
  // usernameFormControl = new FormControl('', [Validators.required]);
  // passwordFormControl = new FormControl('', [Validators.required, Validators.pattern(PASSWORD_REGEX)]);

  usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      this.loading = true;
      return this.authService
        .validateExist({
          email: this.registerForm.controls.email.value,
          username: this.registerForm.controls.username.value,
          phoneNumber: this.registerForm.controls.phoneNumber.value
        })
        .pipe(
          map(data => {
            this.loading = false;
            if (data.success) {
              return {
                existEmail: data.existEmail,
                existUsername: data.existUsername,
                existPhoneNumber: data.existPhoneNumber
              }
            } else {
              return {
                existEmail: true,
                existUsername: true,
                existPhoneNumber: true
              }
            }
          })
        );
    };
  }
  constructor(
    private authService: AuthenticationService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.logout();
    this.registerForm = new FormGroup({
      email: new FormControl(
        "",
        [Validators.required, Validators.pattern(EMAIL_REGEX)],
        this.usernameValidator()
      ),
      username: new FormControl(
        "",
        [Validators.required],
        this.usernameValidator()
      ),
      password: new FormControl(
        "",
        [Validators.required, Validators.pattern(PASSWORD_REGEX)],
        this.usernameValidator()
      ),
      phoneNumber: new FormControl(
        "",
        [Validators.required, Validators.pattern(PHONENUMBER_REGEX)],
        this.usernameValidator()
      )
    });
  }

  openRegisterUI() {
    this.switchToLoginUI = false;
    this.switchToRegisterUI = true;
  }
  openLoginUI() {
    this.switchToLoginUI = true;
    this.switchToRegisterUI = false;
  }

  onLogin() {
    let user = {
      username: this.login.username,
      password: this.login.password
    };
    this.authService.loginUser(user).subscribe(data => {
      this.cdRef.detectChanges();
      if (data.success) {
        this.authService.myID = data._id;
        this.authService.storeToken(data.token);
        let w = window.innerWidth;
        if (w < 900) {
          this.router.navigate(["/roomchats"]);
        } else {
          this.router.navigate(["/home"]);
        }
      } else {
        document.getElementById("msg-error-login").innerHTML = data.msg;
      }
    });
  }

  get emailForm() {
    return this.registerForm.controls.email.value;
  }

  get usernameForm() {
    return this.registerForm.controls.username.value;
  }

  get phoneNumberForm() {
    return this.registerForm.controls.phoneNumber.value;
  }

  get passwordForm() {
    return this.registerForm.controls.password.value;
  }

  onRegister() {
    let registerButton = <HTMLInputElement>(
      document.getElementById("register-button")
    );
    registerButton.disabled = true;
    let user = {
      email: this.emailForm,
      username: this.usernameForm,
      phoneNumber: this.phoneNumberForm,
      password: this.passwordForm
    };
    this.authService.registerUser(user).subscribe(data => {
      registerButton.disabled = false;
      if (data.success) {
        this.openLoginUI();
        this.cdRef.detectChanges();
        document.getElementById("msg-error-login").innerHTML =
          "Đăng ký thành công. Đăng nhập để tiếp tục";
      } else {
        document.getElementById("msg-error-register").innerHTML = data.msg;
      }
    });
  }
}
