import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDashboardComponent } from './student-dashboard.component';
import { CourseService } from '../../../services/course.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

fdescribe('StudentDashboardComponent', () => {
  let component: StudentDashboardComponent;
  let fixture: ComponentFixture<StudentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboardComponent],
      providers: [CourseService, HttpClient, HttpHandler,
        { provide: ActivatedRoute, useValue: { params: of({ id: '123' }) } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
