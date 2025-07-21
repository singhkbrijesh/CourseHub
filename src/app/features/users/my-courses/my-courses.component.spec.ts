import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCoursesComponent } from './my-courses.component';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { CourseService } from '../../../services/course.service';
import { LoadingService } from '../../../services/loading.service';
import { InstructorService } from '../../../services/instructor.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PLATFORM_ID } from '@angular/core';

describe('MyCoursesComponent', () => {
  let component: MyCoursesComponent;
  let fixture: ComponentFixture<MyCoursesComponent>;

  const mockCourses = [
    { id: '1', title: 'Course 1', thumbnail: 'thumb1.jpg' },
    { id: '2', title: 'Course 2', thumbnail: 'thumb2.jpg' },
    { id: '3', title: 'Course 3', thumbnail: 'thumb3.jpg' }
  ];

  const mockEnrollments = [
    { courseId: '1', progress: 0, status: 'active' },
    { courseId: '2', progress: 50, status: 'active' },
    { courseId: '3', progress: 100, status: 'completed' }
  ];

  beforeEach(async () => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockCourseService = jasmine.createSpyObj('CourseService', ['getStudentEnrollments'], {
      userEnrollments$: new BehaviorSubject(mockEnrollments),
      courses$: new BehaviorSubject(mockCourses)
    });
    const mockLoadingService = { loading$: of(false) };
    const mockInstructorService = jasmine.createSpyObj('InstructorService', ['getAllInstructors', 'getInstructorById']);

    mockCourseService.getStudentEnrollments.and.returnValue(of(mockEnrollments));
    mockInstructorService.getAllInstructors.and.returnValue(of([]));
    mockInstructorService.getInstructorById.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        MyCoursesComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CourseService, useValue: mockCourseService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: InstructorService, useValue: mockInstructorService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyCoursesComponent);
    component = fixture.componentInstance;
    
    localStorage.setItem('user', JSON.stringify({ id: 'student1', role: 'student' }));
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user from localStorage on init', () => {
    expect(component.user.id).toBe('student1');
  });

  it('should call getStudentEnrollments for students', () => {
    const mockCourseService = TestBed.inject(CourseService);
    expect(mockCourseService.getStudentEnrollments).toHaveBeenCalledWith('student1');
  });

  it('should filter enrolled courses after enrollments', () => {
    expect(component.enrolledCourses.length).toBe(3);
  });

  it('should apply filters correctly for all', () => {
    component.selectedFilter = 'all';
    component.applyFilters();
    expect(component.filteredCourses.length).toBe(3);
  });

  it('should apply filters correctly for enrolled (progress 0)', () => {
    component.selectedFilter = 'enrolled';
    component.applyFilters();
    expect(component.filteredCourses.length).toBe(1);
  });

  it('should apply filters correctly for in-progress (progress > 0 < 100)', () => {
    component.selectedFilter = 'in-progress';
    component.applyFilters();
    expect(component.filteredCourses.length).toBe(1);
  });

  it('should apply filters correctly for completed (progress 100)', () => {
    component.selectedFilter = 'completed';
    component.applyFilters();
    expect(component.filteredCourses.length).toBe(1);
  });

  it('should call applyFilters on onFilterChange', () => {
    spyOn(component, 'applyFilters');
    component.onFilterChange();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should return correct filter count for all', () => {
    expect(component.getFilterCount('all')).toBe(3);
  });

  it('should return correct filter count for enrolled', () => {
    expect(component.getFilterCount('enrolled')).toBe(1);
  });

  it('should return correct filter count for in-progress', () => {
    expect(component.getFilterCount('in-progress')).toBe(1);
  });

  it('should return correct filter count for completed', () => {
    expect(component.getFilterCount('completed')).toBe(1);
  });

  it('should return progress of enrollment if exists', () => {
    expect(component.getEnrollmentProgress('2')).toBe(50);
  });

  it('should return 0 progress if enrollment does not exist', () => {
    expect(component.getEnrollmentProgress('non-existing')).toBe(0);
  });

  it('should return enrollment status if exists', () => {
    expect(component.getEnrollmentStatus('3')).toBe('completed');
  });

  it('should return unknown status if enrollment does not exist', () => {
    expect(component.getEnrollmentStatus('non-existing')).toBe('unknown');
  });

  it('should navigate on continueCourse', () => {
    const mockRouter = TestBed.inject(Router);
    component.continueCourse('2');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/courses', '2'], { state: { fromMyCourses: true } });
  });
});