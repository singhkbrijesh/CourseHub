import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { CourseService } from '../../../services/course.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Course } from '../../../core/models/course.model';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

fdescribe('AdminDashboardComponent', () => {
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
      imports: [CommonModule, AdminDashboardComponent, HttpClientTestingModule],
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
  });

  it('should set totalUsers and totalEnrollments with mock values', () => {
    component.loadDashboardData();

    expect(component.totalUsers).toBe(0);
    expect(component.totalEnrollments).toBe(0);
  });

  describe('DashboardComponent - initUserChart', () => {

  it('should set userChartOptions correctly based on usersByRole', () => {
    // Arrange: set usersByRole with some data
    component.usersByRole = {
      student: 5,
      instructor: 3
    };

    // Act: call initUserChart
    component.initUserChart();

    // Assert: verify chart options
    expect(component.userChartOptions).toBeDefined();
    expect(component.userChartOptions.series).toEqual([5, 3]);
    expect(component.userChartOptions.labels).toEqual(['student', 'instructor']);
    expect(component.userChartOptions.chart.type).toBe('pie');
    expect(component.userChartOptions.chart.height).toBe(300);
    expect(component.userChartOptions.title.text).toBe('Users by Role');
    expect(component.userChartOptions.legend.position).toBe('bottom');
    expect(component.userChartOptions.responsive[0].breakpoint).toBe(480);
  });
});
});
