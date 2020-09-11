import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public isSubmitted = false;
  public invalidInput = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,

          
          Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}')
        ]
      ]
    });
  }

  /**
   * Gets the form controls of the login form
   */
  public get formControls(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  /**
   * This method logs in the user if the credentials are right and shows a respective error if they are wrong
   */
  public logInUser() {
    if (this.loginForm.invalid) {
      this.isSubmitted = true;
    }
    this.authenticationService
      .login(this.loginForm.value)
      .pipe(first())
      .subscribe(
        (data: User) => {
          this.router.navigate(['/home']);
        },
        error => {
          console.error(error);
          this.invalidInput = true;
        }
      );
  }
}
