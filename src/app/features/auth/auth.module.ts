import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AUTH_ROUTES } from './auth.routes';
import { RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AUTH_ROUTES),
    LoginComponent,
    SignupComponent
  ]
})
export class AuthModule { }
