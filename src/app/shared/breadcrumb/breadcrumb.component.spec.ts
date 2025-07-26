import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { CommonModule } from '@angular/common';

fdescribe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let routerEvents$: BehaviorSubject<any>;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    routerEvents$ = new BehaviorSubject<any>(new NavigationEnd(1, '/home', '/home'));
    mockRouter = {
      url: '/home',
      navigate: jasmine.createSpy('navigate'),
      events: routerEvents$.asObservable()
    };
    mockActivatedRoute = {};

    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent, CommonModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function emitNavigation(url: string) {
    mockRouter.url = url;
    routerEvents$.next(new NavigationEnd(1, url, url));
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to router events and call setBreadcrumbs', () => {
    const spy = spyOn(component, 'setBreadcrumbs').and.callThrough();
    emitNavigation('/admin/dashboard');
    expect(spy).toHaveBeenCalled();
  });

  describe('Admin routes', () => {
    it('should build breadcrumbs for /admin/dashboard', () => {
      emitNavigation('/admin/dashboard');
      expect(component.breadcrumbs[0].label).toBe('Dashboard');
      expect(component.breadcrumbs[0].isClickable).toBeFalse();
    });

    it('should build breadcrumbs for /admin/manage-courses', () => {
      emitNavigation('/admin/manage-courses');
      expect(component.breadcrumbs.length).toBe(2);
      expect(component.breadcrumbs[1].label).toBe('Manage Courses');
    });

    it('should handle edit-course under admin', () => {
      emitNavigation('/admin/edit-course/123');
      expect(component.breadcrumbs.some(b => b.label.includes('Edit Course'))).toBeTrue();
    });

    it('should handle manage-courses/edit-course route', () => {
      emitNavigation('/admin/manage-courses/edit-course/123');
      expect(component.breadcrumbs.some(b => b.label.includes('Edit Course'))).toBeTrue();
    });
  });

  describe('Instructor routes', () => {
    it('should handle instructor dashboard', () => {
      emitNavigation('/instructor/dashboard');
      expect(component.breadcrumbs[0].label).toBe('Dashboard');
      expect(component.breadcrumbs[0].isClickable).toBeFalse();
    });

    it('should handle instructor my-courses', () => {
      emitNavigation('/instructor/my-courses');
      expect(component.breadcrumbs[1].label).toBe('My Courses');
    });

    it('should handle instructor edit-course route', () => {
      emitNavigation('/instructor/edit-course/123');
      expect(component.breadcrumbs.some(b => b.label === 'Edit Course')).toBeTrue();
    });
  });

  describe('User routes', () => {
    it('should handle users dashboard', () => {
      emitNavigation('/users/dashboard');
      expect(component.breadcrumbs[0].label).toBe('Dashboard');
      expect(component.breadcrumbs[0].isClickable).toBeFalse();
    });

    it('should handle users/my-courses', () => {
      emitNavigation('/users/my-courses');
      expect(component.breadcrumbs[1].label).toBe('My Courses');
    });

    it('should add breadcrumb for nested user route', () => {
      emitNavigation('/users/my-courses/course_1');
      expect(component.breadcrumbs.length).toBeGreaterThan(2);
    });
  });

  describe('Course detail route', () => {
    let localStorageSpy: jasmine.Spy;

    beforeEach(() => {
      // Spy localStorage.getItem only ONCE
      localStorageSpy = spyOn(window.localStorage, 'getItem');
    });

    function testRole(role: string | null, expectedPath: string) {
      localStorageSpy.and.callFake(() =>
        role ? JSON.stringify({ role }) : null
      );
      emitNavigation('/courses/course_1');
      expect(component.breadcrumbs[0].path).toBe(expectedPath);
    }

    it('should handle instructor role', () => {
      testRole('instructor', '/instructor/dashboard');
    });

    it('should handle student role', () => {
      testRole('student', '/users/dashboard');
    });

    it('should handle admin role', () => {
      testRole('admin', '/admin/dashboard');
    });

    it('should handle default (no user)', () => {
      testRole(null, '/courses');
    });
  });

  describe('Default route', () => {
    it('should build breadcrumbs for non-special route', () => {
      emitNavigation('/some/random/path');
      expect(component.breadcrumbs.length).toBeGreaterThan(0);
      expect(component.breadcrumbs[0].label).toBe('Some');
    });
  });

  describe('navigateTo', () => {
    it('should navigate if breadcrumb is clickable', () => {
      const crumb = { label: 'Test', path: '/test', isClickable: true };
      component.navigateTo(crumb);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
    });

    it('should not navigate if breadcrumb is not clickable', () => {
      const crumb = { label: 'Test', path: '/test', isClickable: false };
      component.navigateTo(crumb);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
