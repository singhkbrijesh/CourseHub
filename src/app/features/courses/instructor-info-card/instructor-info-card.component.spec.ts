import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorInfoCardComponent } from './instructor-info-card.component';

describe('InstructorInfoCardComponent', () => {
  let component: InstructorInfoCardComponent;
  let fixture: ComponentFixture<InstructorInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorInfoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
