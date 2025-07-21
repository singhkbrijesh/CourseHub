import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstructorInfoCardComponent } from './instructor-info-card.component';

describe('InstructorInfoCardComponent', () => {
  let component: InstructorInfoCardComponent;
  let fixture: ComponentFixture<InstructorInfoCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InstructorInfoCardComponent] // Standalone component
    });

    fixture = TestBed.createComponent(InstructorInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('formatNumber', () => {
    it('should format numbers >= 1,000,000 as M', () => {
      expect(component.formatNumber(2500000)).toBe('2.5M');
      expect(component.formatNumber(1000000)).toBe('1.0M');
    });

    it('should format numbers >= 1,000 as K', () => {
      expect(component.formatNumber(1500)).toBe('2K'); // Rounded
      expect(component.formatNumber(1000)).toBe('1K');
    });

    it('should return number as string if < 1000', () => {
      expect(component.formatNumber(999)).toBe('999');
      expect(component.formatNumber(0)).toBe('0');
    });
  });
});
