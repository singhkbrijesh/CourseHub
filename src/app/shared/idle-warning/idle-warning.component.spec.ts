import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IdleWarningComponent } from './idle-warning.component';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

fdescribe('IdleWarningComponent', () => {
  let component: IdleWarningComponent;
  let fixture: ComponentFixture<IdleWarningComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<IdleWarningComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [IdleWarningComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IdleWarningComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Cleanup subscriptions after each test
    if (component['countdownSubscription']) {
      component['countdownSubscription'].unsubscribe();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start countdown on ngOnInit', fakeAsync(() => {
    component.countdown = 2;
    spyOn(component, 'logout').and.callThrough();

    component.ngOnInit();
    expect(component['countdownSubscription']).toBeTruthy();

    // Move time forward by 1 second
    tick(1000);
    expect(component.countdown).toBe(1);

    // Move time forward by another 1 second (countdown hits 0)
    tick(1000);
    expect(component.logout).toHaveBeenCalled();
  }));

  it('should unsubscribe on ngOnDestroy', () => {
    component.ngOnInit();
    const sub = component['countdownSubscription']!;
    spyOn(sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('stayLoggedIn should close dialog with "stay"', () => {
    component.stayLoggedIn();
    expect(dialogRefSpy.close).toHaveBeenCalledWith('stay');
  });

  it('logout should close dialog with "logout"', () => {
    component.logout();
    expect(dialogRefSpy.close).toHaveBeenCalledWith('logout');
  });
});
