import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { IdleWarningComponent } from './shared/idle-warning/idle-warning.component';
import { MatDialog } from '@angular/material/dialog';

fdescribe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{provide: ActivatedRoute, useValue: { params: of({ id: '123' }) }}],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'coursehub' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('coursehub');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toBeUndefined();
  });

  describe('resetIdleTimer', () => {
  beforeEach(() => {
    // Ensure timers are cleared before each test
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should not set timer if user is not logged in', () => {
    spyOn(component as any, 'isUserLoggedIn').and.returnValue(false);
    spyOn(component as any, 'clearIdleTimers');

    (component as any).resetIdleTimer();

    expect((component as any).clearIdleTimers).not.toHaveBeenCalled();
    expect((component as any).idleTimer).toBeUndefined();
  });

  it('should clear existing timers and set new timeout if user is logged in', () => {
    spyOn(component as any, 'isUserLoggedIn').and.returnValue(true);
    spyOn(component as any, 'clearIdleTimers');
    spyOn(component as any, 'showIdleWarning');

    (component as any).resetIdleTimer();

    expect((component as any).clearIdleTimers).toHaveBeenCalled();
    expect((component as any).idleTimer).toBeDefined();

    jasmine.clock().tick(900000);
    expect((component as any).showIdleWarning).toHaveBeenCalled();
  });
  });
  
  describe('showIdleWarning', () => {
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    component['dialog'] = dialogSpy;
    spyOn(component as any, 'isUserLoggedIn').and.returnValue(true);
    spyOn(component as any, 'resetIdleTimer');
    spyOn(component as any, 'logout');
  });

  it('should not open dialog if user is not logged in', () => {
    (component as any).isUserLoggedIn.and.returnValue(false);
    (component as any).showIdleWarning();
    expect(dialogSpy.closeAll).not.toHaveBeenCalled();
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('should open dialog and reset idle timer when user clicks stay', () => {
    const afterClosedSpy = of('stay');
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosedSpy } as any);

    (component as any).showIdleWarning();

    expect(dialogSpy.closeAll).toHaveBeenCalled();
    expect(dialogSpy.open).toHaveBeenCalledWith(IdleWarningComponent, jasmine.objectContaining({
      width: '450px',
      disableClose: true
    }));
    expect((component as any).resetIdleTimer).toHaveBeenCalled();
    expect((component as any).logout).not.toHaveBeenCalled();
  });

  it('should open dialog and call logout when user dismisses or times out', () => {
    const afterClosedSpy = of('logout');
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosedSpy } as any);

    (component as any).showIdleWarning();

    expect(dialogSpy.closeAll).toHaveBeenCalled();
    expect(dialogSpy.open).toHaveBeenCalled();
    expect((component as any).logout).toHaveBeenCalled();
    expect((component as any).resetIdleTimer).not.toHaveBeenCalled();
  });
});

  describe('logout & clearIdleTimers', () => {
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    (component as any).dialog = dialogSpy;
    (component as any).router = routerSpy;
    (component as any).platformId = 'browser';

    // spyOnProperty(component as any, 'isPlatformBrowser', 'get').and.returnValue(true);
    spyOn(window.localStorage, 'removeItem');
    spyOn(window, 'dispatchEvent');

    (component as any).idleTimer = setTimeout(() => {}, 1000);
    (component as any).warningTimer = setTimeout(() => {}, 1000);
  });

  it('should clear idle timers', () => {
    (component as any).clearIdleTimers();
    expect((component as any).idleTimer).toBeNull();
    expect((component as any).warningTimer).toBeNull();
  });

  it('should remove user from storage, clear timers, close dialogs, and navigate', () => {
    (component as any).logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('userChanged'));
    expect((component as any).idleTimer).toBeNull();
    expect((component as any).warningTimer).toBeNull();
    expect(dialogSpy.closeAll).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
  });
  
  describe('handleClickOutsideSidebar', () => {
  beforeEach(() => {
    component.sidebarShow = true;
  });

  it('should hide sidebar if click is outside sidebar element', () => {
    const sidebarElement = document.createElement('div');
    sidebarElement.classList.add('sidebar-slider');
    document.body.appendChild(sidebarElement);

    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    spyOn(document, 'querySelector').and.returnValue(sidebarElement);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: outsideElement });

    component.handleClickOutsideSidebar(clickEvent);

    expect(component.sidebarShow).toBeFalse();

    document.body.removeChild(sidebarElement);
    document.body.removeChild(outsideElement);
  });

  it('should not hide sidebar if click is inside sidebar element', () => {
    const sidebarElement = document.createElement('div');
    sidebarElement.classList.add('sidebar-slider');
    document.body.appendChild(sidebarElement);

    spyOn(document, 'querySelector').and.returnValue(sidebarElement);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: sidebarElement });

    component.handleClickOutsideSidebar(clickEvent);

    expect(component.sidebarShow).toBeTrue();

    document.body.removeChild(sidebarElement);
  });

  it('should do nothing if sidebarShow is false', () => {
    component.sidebarShow = false;
    const clickEvent = new MouseEvent('click');
    component.handleClickOutsideSidebar(clickEvent);
    expect(component.sidebarShow).toBeFalse();
  });
  });
  
  describe('loadUser', () => {
  beforeEach(() => {
    // spyOnProperty(component, 'platformId').and.returnValue('browser');
    spyOn(component as any, 'resetIdleTimer').and.callThrough();
    spyOn(component as any, 'clearIdleTimers').and.callThrough();
  });

  it('should load user from localStorage and reset idle timer if user is logged in', () => {
    const mockUser = { name: 'Test User', role: 'student' };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
    spyOn<any>(component, 'isUserLoggedIn').and.returnValue(true);

    component.loadUser();

    expect(component.user).toEqual(mockUser);
    expect(component['resetIdleTimer']).toHaveBeenCalled();
    // expect(component['clearIdleTimers']).not.toHaveBeenCalled();
  });

  it('should load default user and clear idle timer if user is not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn<any>(component, 'isUserLoggedIn').and.returnValue(false);

    component.loadUser();

    expect(component.user).toEqual({ name: '', role: '' });
    expect(component['clearIdleTimers']).toHaveBeenCalled();
    expect(component['resetIdleTimer']).not.toHaveBeenCalled();
  });

  it('should handle non-browser platform', () => {
    // spyOnProperty(component, 'platformId').and.returnValue('server');

    component.loadUser();

    expect(component.user).toEqual({ name: '', role: '' });
  });
  });
  
  describe('onStorageChange', () => {
  it('should call loadUser when "user" key changes in localStorage', () => {
    spyOn(component, 'loadUser');

    const event = new StorageEvent('storage', { key: 'user' });
    component.onStorageChange(event);

    expect(component.loadUser).toHaveBeenCalled();
  });

  it('should not call loadUser when another key changes', () => {
    spyOn(component, 'loadUser');

    const event = new StorageEvent('storage', { key: 'other' });
    component.onStorageChange(event);

    expect(component.loadUser).not.toHaveBeenCalled();
  });
});

describe('onUserChanged', () => {
  it('should call loadUser when onUserChanged is triggered', () => {
    spyOn(component, 'loadUser');
    component.onUserChanged();
    expect(component.loadUser).toHaveBeenCalled();
  });
});

});
