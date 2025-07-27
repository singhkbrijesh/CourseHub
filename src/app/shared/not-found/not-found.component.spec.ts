import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Mock router
class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

fdescribe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let router: RouterStub;

  beforeEach(async () => {
    router = new RouterStub();

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('goHome', () => {
    it('should navigate to admin dashboard if user role is admin', () => {
      localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
      component.goHome();
      expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    });

    it('should navigate to instructor dashboard if user role is instructor', () => {
      localStorage.setItem('user', JSON.stringify({ role: 'instructor' }));
      component.goHome();
      expect(router.navigate).toHaveBeenCalledWith(['/instructor/dashboard']);
    });

    it('should navigate to student dashboard if user role is student', () => {
      localStorage.setItem('user', JSON.stringify({ role: 'student' }));
      component.goHome();
      expect(router.navigate).toHaveBeenCalledWith(['/users/dashboard']);
    });

    it('should navigate to /courses if user role is unknown', () => {
      localStorage.setItem('user', JSON.stringify({ role: 'unknown' }));
      component.goHome();
      expect(router.navigate).toHaveBeenCalledWith(['/courses']);
    });

    it('should navigate to /courses if user is not found in localStorage', () => {
      localStorage.removeItem('user');
      component.goHome();
      expect(router.navigate).toHaveBeenCalledWith(['/courses']);
    });
  });

  describe('goBack', () => {
    it('should call window.history.back when in browser', () => {
      const backSpy = spyOn(window.history, 'back');
      component.goBack();
      expect(backSpy).toHaveBeenCalled();
    });
  });
});
