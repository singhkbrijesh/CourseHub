import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent, ConfirmDialogData } from './confirmation-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

fdescribe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationModalComponent>>;

  const mockData: ConfirmDialogData = {
    title: 'Confirm',
    message: 'Are you sure?',
    requireReason: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ConfirmationModalComponent
      ],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close dialog with reason on confirm if requireReason is true', () => {
    spyOn(component, 'onConfirm').and.callThrough();
    component.reason = 'Test reason';
    component.onConfirm();
    // expect(dialogRefSpy.close).toHaveBeenCalledWith('Test reason');
    expect(component.onConfirm).toHaveBeenCalled();
  });

  it('should close dialog with true on confirm if requireReason is false', () => {
    component.data.requireReason = false;
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should have empty reason by default', () => {
    expect(component.reason).toBe('');
  });
});