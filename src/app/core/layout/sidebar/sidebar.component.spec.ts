import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

fdescribe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let routerEvents$: Subject<any>;
  let routerMock: any;

  beforeEach(async () => {
    routerEvents$ = new Subject<any>();

    routerMock = {
      url: '/admin/admin-dashboard',
      events: routerEvents$.asObservable(),
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, SidebarComponent],
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set admin menu items when user role is admin', () => {
    component.user = { name: 'Admin User', role: 'admin' };
    component.ngOnChanges({
      user: {
        currentValue: component.user,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.menuItems.length).toBe(5);
    expect(component.menuItems[0].label).toBe('Admin Dashboard');
  });

  it('should set student menu items when user role is student', () => {
    component.user = { name: 'Student', role: 'student' };
    component.ngOnChanges({
      user: {
        currentValue: component.user,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.menuItems.length).toBe(3);
    expect(component.menuItems[0].label).toBe('Dashboard');
  });

  it('should highlight active menu based on current route', () => {
    component.user = { name: 'Admin', role: 'admin' };
    component.ngOnInit();

    component.menuItems = [
      { label: 'Admin Dashboard', route: '/admin/admin-dashboard' },
      { label: 'Manage Users', route: '/admin/manage-users' }
    ];

    component.currentRoute = '/admin/admin-dashboard';
    component['updateActiveState']();
    expect(component.menuItems[0].isActive).toBeTrue();
    expect(component.menuItems[1].isActive).toBeFalse();
  });

  it('should navigate to route and emit closeSidebar when onMenuClick is called', () => {
    spyOn(component.closeSidebar, 'emit');
    component.onMenuClick('/admin/manage-users');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/manage-users']);
    expect(component.closeSidebar.emit).toHaveBeenCalled();
  });

  it('should emit closeSidebar when onClose is called', () => {
    spyOn(component.closeSidebar, 'emit');
    component.onClose();
    expect(component.closeSidebar.emit).toHaveBeenCalled();
  });

  it('should update active state on router NavigationEnd event', () => {
    component.user = { name: 'Admin', role: 'admin' };
    component.ngOnInit();
    component.menuItems = [
      { label: 'Admin Dashboard', route: '/admin/admin-dashboard' },
      { label: 'Manage Users', route: '/admin/manage-users' }
    ];
    routerEvents$.next(new NavigationEnd(1, '/admin/manage-users', '/admin/manage-users'));

    expect(component.menuItems[0].isActive).toBeFalse();
    expect(component.menuItems[1].isActive).toBeTrue();
  });

  describe('SidebarComponent - setMenuItems', () => {

  beforeEach(() => {
    const routerMock = {
      events: { pipe: () => ({ subscribe: () => {} }) },
      url: '',
      navigate: jasmine.createSpy('navigate')
    } as any;

    component = new SidebarComponent(routerMock);
  });

  it('should set admin menu items for admin role', () => {
    component.setMenuItems('admin');
    expect(component.menuItems.length).toBe(5);
    expect(component.menuItems[0].label).toBe('Admin Dashboard');
    expect(component.menuItems[0].route).toBe('/admin/admin-dashboard');
  });

  it('should set instructor menu items for instructor role', () => {
    component.setMenuItems('instructor');
    expect(component.menuItems.length).toBe(6);
    expect(component.menuItems[0].label).toBe('Dashboard');
    expect(component.menuItems[0].route).toBe('/instructor/dashboard');
  });

  it('should set student menu items for student role', () => {
    component.setMenuItems('student');
    expect(component.menuItems.length).toBe(3);
    expect(component.menuItems[0].label).toBe('Dashboard');
    expect(component.menuItems[0].route).toBe('/users/dashboard');
  });

  it('should clear menu items for invalid role', () => {
    component.setMenuItems('unknownRole');
    expect(component.menuItems.length).toBe(0);
  });
});

});


