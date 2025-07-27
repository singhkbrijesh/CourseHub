import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MyCoursesComponent } from './my-courses.component';
import { InstructorService } from '../../../services/instructor.service';
import { Course } from '../../../core/models/course.model';
import { HttpClient, HttpHandler } from '@angular/common/http';

fdescribe('MyCoursesComponent', () => {
  let component: MyCoursesComponent;
  let fixture: ComponentFixture<MyCoursesComponent>;
  let instructorServiceMock: any;
  let routerMock: any;
  let coursesSubject: Subject<Course[]>;

  beforeEach(async () => {
    coursesSubject = new Subject<Course[]>();

    instructorServiceMock = {
      instructorCourses$: coursesSubject.asObservable(),
      getInstructorCourses: jasmine.createSpy('getInstructorCourses').and.returnValue(of([]))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [MyCoursesComponent],
      providers: [ HttpClient, HttpHandler,
        { provide: InstructorService, useValue: instructorServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyCoursesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should load user from localStorage on init', () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Test' }));
    spyOn(component, 'loadInstructorCourses');
    fixture.detectChanges(); // triggers ngOnInit
    expect(component.currentUser.id).toBe('u1');
    expect(component.loadInstructorCourses).toHaveBeenCalled();
  });

  it('should update courses and loading when subscription emits courses', () => {
    fixture.detectChanges(); // triggers ngOnInit
    coursesSubject.next([{ id: 'c1', title: 'Angular', status: 'approved', lessons: [] } as any]);
    expect(component.courses.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('loadInstructorCourses should fetch courses when currentUser.id is set', () => {
    component.currentUser = { id: 'instructor1' };
    const mockCourses = [{ id: '1', title: 'Course 1', lessons: [] }] as unknown as Course[];
    instructorServiceMock.getInstructorCourses.and.returnValue(of(mockCourses));
    component.loadInstructorCourses();
    expect(component.courses).toEqual(mockCourses);
    expect(component.loading).toBeFalse();
  });

  it('loadInstructorCourses should handle error', () => {
    spyOn(console, 'error');
    component.currentUser = { id: 'instructor1' };
    instructorServiceMock.getInstructorCourses.and.returnValue(throwError(() => new Error('Network error')));
    component.loadInstructorCourses();
    expect(console.error).toHaveBeenCalledWith('Error loading courses:', jasmine.any(Error));
    expect(component.loading).toBeFalse();
  });

  it('getTotalDuration should return 0 if lessons are undefined', () => {
    const course = { id: '1', lessons: undefined } as any;
    expect(component.getTotalDuration(course)).toBe(0);
  });

  it('getTotalDuration should sum lesson durations', () => {
    const course = {
      id: '1',
      lessons: [{ duration: 30 }, { duration: 20 }]
    } as any;
    expect(component.getTotalDuration(course)).toBe(50);
  });

  it('createNewCourse should navigate to create course', () => {
    component.createNewCourse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/instructor/create-course']);
  });

  it('editCourse should navigate with correct params', () => {
    component.editCourse('c1');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/instructor/edit-course', 'c1'],
      { state: { from: 'instructor-my-courses' } }
    );
  });

  it('viewCourse should navigate with correct state', () => {
    component.viewCourse('c2');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/courses', 'c2'],
      { state: { fromMyCourses: true, fromInstructor: true } }
    );
  });

  it('getStatusColor should return correct color', () => {
    expect(component.getStatusColor('approved')).toBe('primary');
    expect(component.getStatusColor('pending')).toBe('accent');
    expect(component.getStatusColor('rejected')).toBe('warn');
    expect(component.getStatusColor('other')).toBe('');
  });
});
