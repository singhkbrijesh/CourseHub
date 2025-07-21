import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { CourseService } from '../../../services/course.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Course } from '../../../core/models/course.model';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let courseServiceMock: any;

  const mockCourses: Course[] = [
    { id: '1', title: 'Angular Basics', status: 'approved' } as Course,
    { id: '2', title: 'React Basics', status: 'pending' } as Course,
    { id: '3', title: 'Vue Basics', status: 'pending' } as Course,
    { id: '4', title: 'Node Basics', status: 'approved' } as Course,
    { id: '5', title: 'Python Basics', status: 'approved' } as Course,
    { id: '6', title: 'Java Basics', status: 'pending' } as Course
  ];

  beforeEach(async () => {
    courseServiceMock = {
      getCourses: jasmine.createSpy('getCourses').and.returnValue(of(mockCourses))
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, AdminDashboardComponent],
      providers: [
        { provide: CourseService, useValue: courseServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data correctly on init', () => {
    component.ngOnInit();

    expect(courseServiceMock.getCourses).toHaveBeenCalled();
    expect(component.totalCourses).toBe(6);
    expect(component.pendingApprovals).toBe(3);
    expect(component.recentCourses.length).toBe(5);
    expect(component.recentCourses[0].title).toBe('Angular Basics');
    expect(component.recentCourses[4].title).toBe('Python Basics');
  });

  it('should set totalUsers and totalEnrollments with mock values', () => {
    component.loadDashboardData();

    expect(component.totalUsers).toBe(25);
    expect(component.totalEnrollments).toBe(150);
  });
});
