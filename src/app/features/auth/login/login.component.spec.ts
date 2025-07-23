import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { of, throwError, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

fdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerMock: any;
  let authServiceMock: any;
  let loadingServiceMock: any;

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    authServiceMock = {
      login: jasmine.createSpy('login')
    };

    loadingServiceMock = {
      loading$: new Subject<boolean>()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form as touched if invalid on submit', () => {
    spyOn(component.loginForm, 'markAllAsTouched');
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should navigate to admin dashboard on successful login as admin', () => {
    component.loginForm.setValue({ email: 'admin@test.com', password: 'password' });
    authServiceMock.login.and.returnValue(of({ role: 'admin' }));
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/admin-dashboard']);
  });

  it('should navigate to instructor dashboard on successful login as instructor', () => {
    component.loginForm.setValue({ email: 'instructor@test.com', password: 'password' });
    authServiceMock.login.and.returnValue(of({ role: 'instructor' }));
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/instructor/dashboard']);
  });

  it('should navigate to student dashboard on successful login as student', () => {
    component.loginForm.setValue({ email: 'student@test.com', password: 'password' });
    authServiceMock.login.and.returnValue(of({ role: 'student' }));
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/users/dashboard']);
  });

  it('should navigate to courses on unknown role', () => {
    component.loginForm.setValue({ email: 'other@test.com', password: 'password' });
    authServiceMock.login.and.returnValue(of({ role: 'other' }));
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/courses']);
  });

  it('should set error message on failed login', () => {
    component.loginForm.setValue({ email: 'wrong@test.com', password: 'wrongpass' });
    authServiceMock.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    component.onSubmit();
    expect(component.errorMessage).toBe('Invalid email or password');
  });

  it('should navigate to signup page', () => {
    component.goToSignup();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/signup']);
  });

  it('should update loading state from loading service', () => {
    loadingServiceMock.loading$.next(true);
    expect(component.loading).toBeTrue();

    loadingServiceMock.loading$.next(false);
    expect(component.loading).toBeFalse();
  });
});
