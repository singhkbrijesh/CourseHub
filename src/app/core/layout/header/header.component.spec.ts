import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ThemeService, Theme } from '../../../services/theme.service';
import { isPlatformBrowser } from '@angular/common';

// Mocks
const mockTheme = { name: 'Light', icon: 'light_mode' } as Theme;

class MockThemeService {
  themes = [mockTheme];
  currentTheme$ = of(mockTheme);

  getCurrentTheme() {
    return mockTheme;
  }

  isDarkMode() {
    return false;
  }

  toggleTheme() {}

  setTheme(theme: Theme) {}
}

class MockRouter {
  events = new Subject();
  url = '/dashboard';

  navigate = jasmine.createSpy('navigate');
}

fdescribe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      // declarations: [HeaderComponent],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ThemeService, useClass: MockThemeService },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ name: 'Test User', role: 'admin' }));
    spyOn(localStorage, 'clear');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit', () => {
    component.isBrowser = true;
    component.ngOnInit();
    expect(component.isBrowser).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(component.user).toEqual({ name: '', role: '' });
  });

  it('should subscribe to theme changes and update theme data', () => {
    expect(component.currentTheme).toEqual(mockTheme);
    expect(component.isDarkMode).toBeFalse();
  });

  it('should emit sidebar toggle event', () => {
    spyOn(component.sidebarToggle, 'emit');
    component.onSidebarToggle();
    expect(component.sidebarToggle.emit).toHaveBeenCalled();
  });

  it('should call ThemeService.toggleTheme()', () => {
    const themeService = TestBed.inject(ThemeService) as MockThemeService;
    spyOn(themeService, 'toggleTheme');
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should call ThemeService.setTheme() with selected theme', () => {
    const themeService = TestBed.inject(ThemeService) as MockThemeService;
    spyOn(themeService, 'setTheme');
    component.selectTheme(mockTheme);
    expect(themeService.setTheme).toHaveBeenCalledWith(mockTheme);
  });

  it('should return correct theme icon', () => {
    expect(component.themeIcon).toBe('light_mode');
  });

  it('should clear localStorage and navigate to auth on logout', () => {
    component.logout();
    expect(localStorage.clear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('should navigate to login page', () => {
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('should navigate to courses page', () => {
    component.goToCourses();
    expect(router.navigate).toHaveBeenCalledWith(['/courses']);
  });

  it('should check if current route is login page', () => {
    router.url = '/auth';
    component.checkIfLoginPage();
    expect(component.isLoginPage).toBeTrue();
  });

  it('should handle router events and update user data', () => {
    router.url = '/dashboard';
    router.events.next(new NavigationEnd(1, '/prev', '/dashboard'));
    expect(component.user).toEqual({ name: 'Test User', role: 'admin' });
    expect(component.isLoginPage).toBeFalse();
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    const themeSub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    const routerSub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['themeSubscription'] = themeSub;
    component['routerSubscription'] = routerSub;

    component.ngOnDestroy();

    expect(themeSub.unsubscribe).toHaveBeenCalled();
    expect(routerSub.unsubscribe).toHaveBeenCalled();
  });
});
 