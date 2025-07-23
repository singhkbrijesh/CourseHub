import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { of, throwError, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

fdescribe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceMock: any;
  let routerMock: any;
  let loadingServiceMock: any;

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    authServiceMock = {
      register: jasmine.createSpy('register')
    };

    loadingServiceMock = {
      loading$: new Subject<boolean>()
    };

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form when passwords do not match', () => {
    component.signupForm.setValue({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
      confirmPassword: '654321',
      role: 'student'
    });
    expect(component.signupForm.errors?.['passwordMismatch']).toBeTrue();
  });

  it('should mark form as touched when invalid on submit', () => {
    spyOn(component.signupForm, 'markAllAsTouched');
    component.signupForm.setValue({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
    component.onSubmit();
    expect(component.signupForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should call authService.register and show success message on success', fakeAsync(() => {
    component.signupForm.setValue({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
      confirmPassword: '123456',
      role: 'student'
    });
    authServiceMock.register.and.returnValue(of({}));

    component.onSubmit();
    expect(authServiceMock.register).toHaveBeenCalledWith({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
      role: 'student'
    });
    expect(component.successMessage).toBe('Registration successful! Redirecting to login...');

    tick(2000);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should set email already exists error message on error', () => {
    component.signupForm.setValue({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
      confirmPassword: '123456',
      role: 'student'
    });
    authServiceMock.register.and.returnValue(
      throwError(() => new Error('email already exists'))
    );

    component.onSubmit();
    expect(component.errorMessage).toBe('Email already exists. Please use a different email.');
  });

  it('should set generic error message on unknown error', () => {
    component.signupForm.setValue({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
      confirmPassword: '123456',
      role: 'student'
    });
    authServiceMock.register.and.returnValue(
      throwError(() => new Error('server unavailable'))
    );

    component.onSubmit();
    expect(component.errorMessage).toBe('Registration failed. Please try again.');
  });

  it('should navigate to login when goToLogin is called', () => {
    component.goToLogin();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should update loading state from loading service', () => {
    loadingServiceMock.loading$.next(true);
    expect(component.loading).toBeTrue();

    loadingServiceMock.loading$.next(false);
    expect(component.loading).toBeFalse();
  });
});
