import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseApprovalsComponent } from './course-approvals.component';

describe('CourseApprovalsComponent', () => {
  let component: CourseApprovalsComponent;
  let fixture: ComponentFixture<CourseApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
