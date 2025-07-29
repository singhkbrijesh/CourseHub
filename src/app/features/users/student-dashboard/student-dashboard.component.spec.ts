import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StudentDashboardComponent } from './student-dashboard.component';
import { CourseService } from '../../../services/course.service';
import { LoadingService } from '../../../services/loading.service';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { Enrollment } from '../../../core/models/course.model';

fdescribe('StudentDashboardComponent', () => {
  let component: StudentDashboardComponent;
  let fixture: ComponentFixture<StudentDashboardComponent>;
  let courseServiceMock: any;
  let loadingServiceMock: any;
  let routerMock: any;

  const mockUser = { id: 'student1', name: 'Test Student' };
  const mockEnrollments = [
    { courseId: 'c1', progress: 100, status: 'completed' },
    { courseId: 'c2', progress: 50, status: 'active' },
    { courseId: 'c3', progress: 0, status: 'active' }
  ] as Enrollment[];
  const mockCourses = [
    { id: 'c1', status: 'approved' },
    { id: 'c2', status: 'approved' },
    { id: 'c3', status: 'pending' },
    { id: 'c4', status: 'approved' }
  ];
  const mockLoginActivities = [
    { loginTime: '2024-07-25T10:00:00Z' },
    { loginTime: '2024-07-26T09:00:00Z' },
    { loginTime: '2024-07-24T08:00:00Z' }
  ];

  beforeEach(async () => {
    courseServiceMock = {
      getStudentEnrollments: jasmine.createSpy().and.returnValue(of(mockEnrollments)),
      getStudentLoginActivities: jasmine.createSpy().and.returnValue(of(mockLoginActivities)),
      getCourses: jasmine.createSpy().and.returnValue(of(mockCourses)),
      enrollInCourse: jasmine.createSpy().and.returnValue(of({}))
    };
    loadingServiceMock = {
      loading$: new BehaviorSubject(false)
    };
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [StudentDashboardComponent, CommonModule, MatProgressBarModule],
      providers: [
        { provide: CourseService, useValue: courseServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user from localStorage on init', () => {
    expect(component.user).toEqual(mockUser);
  });

  // it('should load enrollments, login activities, and courses', fakeAsync(() => {
  //   component.loadUserDashboard();
  //   tick();
  //   expect(courseServiceMock.getStudentEnrollments).toHaveBeenCalledWith('student1');
  //   expect(courseServiceMock.getStudentLoginActivities).toHaveBeenCalledWith('student1');
  //   expect(courseServiceMock.getCourses).toHaveBeenCalled();
  //   expect(component.enrollments.length).toBe(3);
  //   expect(component.enrolledCourses.length).toBe(2); // Only c1 and c2 match enrollments
  //   expect(component.recentCourses.length).toBe(3); // Only approved courses, sliced to 3
  //   expect(component.recentLoginActivities.length).toBeLessThanOrEqual(5);
  // }));

  it('should calculate progress correctly', () => {
    component.enrollments = mockEnrollments;
    component.calculateProgress();
    expect(component.overallProgress).toBe(Math.round((100 + 50 + 0) / 3));
    expect(component.completedCourses).toBe(1);
    expect(component.inProgressCourses).toBe(2);
  });

  it('should return correct enrollment progress', () => {
    component.enrollments = mockEnrollments;
    expect(component.getEnrollmentProgress('c1')).toBe(100);
    expect(component.getEnrollmentProgress('c2')).toBe(50);
    expect(component.getEnrollmentProgress('c3')).toBe(0);
    expect(component.getEnrollmentProgress('cX')).toBe(0);
  });

  it('should return correct course button text', () => {
    component.enrollments = mockEnrollments;
    expect(component.getCourseButtonText('c1')).toBe('Revisit');
    expect(component.getCourseButtonText('c2')).toBe('Continue');
    expect(component.getCourseButtonText('c3')).toBe('Start Course');
    expect(component.getCourseButtonText('cX')).toBe('Start Course');
  });

  it('should format time correctly', () => {
    const date = new Date('2024-07-26T09:00:00Z');
    const formatted = component.formatTime(date);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should navigate to course detail with state on continueCourse', () => {
    component.continueCourse('c1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/courses', 'c1'], { state: { fromDashboard: true } });
  });

  it('should enroll in course and reload dashboard on success', fakeAsync(() => {
    spyOn(window, 'alert');
    component.enrollInCourse('c4');
    tick();
    expect(courseServiceMock.enrollInCourse).toHaveBeenCalledWith('c4', 'student1');
    expect(window.alert).toHaveBeenCalledWith('Successfully enrolled in course!');
  }));

  it('should show error on enrollment failure', fakeAsync(() => {
    spyOn(window, 'alert');
    courseServiceMock.enrollInCourse.and.returnValue(throwError(() => new Error('fail')));
    component.enrollInCourse('c4');
    tick();
    expect(window.alert).toHaveBeenCalledWith('Failed to enroll in course or course not found. Please try again..');
  }));

  it('should update loading state from LoadingService', () => {
    loadingServiceMock.loading$.next(true);
    fixture.detectChanges();
    expect(component.loading).toBeTrue();
    loadingServiceMock.loading$.next(false);
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
  });
});