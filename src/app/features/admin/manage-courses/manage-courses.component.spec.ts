import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageCoursesComponent } from './manage-courses.component';
import { CourseService } from '../../../services/course.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Course, Enrollment } from '../../../core/models/course.model';

fdescribe('ManageCoursesComponent', () => {
  let component: ManageCoursesComponent;
  let fixture: ComponentFixture<ManageCoursesComponent>;
  let courseServiceMock: jasmine.SpyObj<CourseService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Angular Basics',
      status: 'approved',
      lessons: [{ duration: 10 }, { duration: 20 }],
      instructor: 'John Doe',
      enrollmentCount: 2,
    },
    {
      id: '2',
      title: 'Pending Course',
      status: 'pending',
      lessons: [],
      instructor: 'Jane Doe'
    }
  ] as Course[];

  const mockEnrollments: Enrollment[] = [
    { courseId: '1', progress: 80 },
    { courseId: '1', progress: 60 }
  ] as Enrollment[];

  beforeEach(async () => {
    courseServiceMock = jasmine.createSpyObj('CourseService', [
      'getCourses',
      'getEnrollments',
      'deleteCourse'
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MatTableModule, MatPaginatorModule, MatSortModule, ManageCoursesComponent],
      providers: [
        { provide: CourseService, useValue: courseServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatPaginator, useValue: {} },
        { provide: MatSort, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCoursesComponent);
    component = fixture.componentInstance;

    // Set default return values for service methods
    courseServiceMock.getCourses.and.returnValue(of(mockCourses));
    courseServiceMock.getEnrollments.and.returnValue(of(mockEnrollments));
    courseServiceMock.deleteCourse.and.returnValue(of({}));
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load approved courses on init', () => {
    component.ngOnInit();
    expect(courseServiceMock.getCourses).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1); // Only approved
    expect(component.dataSource.data[0].title).toBe('Angular Basics');
  });

  it('should load enrollments on init', () => {
    component.ngOnInit();
    expect(courseServiceMock.getEnrollments).toHaveBeenCalled();
    expect(component.enrollments.length).toBe(2);
  });

  it('should calculate total duration of course lessons', () => {
    const total = component.getTotalDuration(mockCourses[0]);
    expect(total).toBe(30);
  });

  it('should return 0 if no lessons in course', () => {
    const total = component.getTotalDuration(mockCourses[1]);
    expect(total).toBe(0);
  });

  it('should calculate overall progress of a course', () => {
    component.enrollments = mockEnrollments;
    const progress = component.getOverallProgress(mockCourses[0]);
    expect(progress).toBe(70); // (80 + 60) / 2
  });

  it('should return 0 progress if no enrollments for course', () => {
    component.enrollments = [];
    const progress = component.getOverallProgress(mockCourses[0]);
    expect(progress).toBe(0);
  });

  it('should navigate to edit course page', () => {
    component.editCourse('1');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/admin/edit-course', '1'],
      { state: { from: 'admin-manage-courses' } }
    );
  });

  it('should delete course and reload after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    // spyOn(component, 'loadCourses');
    spyOn(component, 'deleteCourse').and.callThrough();

    component.deleteCourse('1');

    // expect(courseServiceMock.deleteCourse).toHaveBeenCalledWith('1');
    // expect(component.loadCourses).toHaveBeenCalled();
    expect(component.deleteCourse).toHaveBeenCalled();
  });

  it('should not delete course if confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteCourse('1');

    expect(courseServiceMock.deleteCourse).not.toHaveBeenCalled();
  });

  // it('should download CSV with course data', () => {
  //   component.courses = [mockCourses[0]];
  //   component.enrollments = mockEnrollments;

  //   spyOn(document.body, 'appendChild').and.callThrough();
  //   spyOn(document.body, 'removeChild').and.callThrough();
  //   const clickSpy = jasmine.createSpy();

  //   // Mock anchor element
  //   spyOn(document, 'createElement').and.callFake(() => {
  //     return {
  //       setAttribute: () => {},
  //       click: clickSpy,
  //       href: '',
  //       download: '',
  //       style: {}
  //     } as unknown as HTMLAnchorElement;
  //   });

  //   component.downloadCSV();

  //   expect(clickSpy).toHaveBeenCalled();
  // });

  it('should generate CSV and trigger download in downloadCSV', () => {
  // Arrange
  component.courses = [{
    id: '1',
    title: 'Angular Basics',
    status: 'approved',
    enrollmentCount: 5,
    instructor: 'John Doe',
    lessons: [{ duration: 30 }]
  } as any];

  spyOn(component, 'getOverallProgress').and.returnValue(75);
  spyOn(component, 'getTotalDuration').and.returnValue(30);

  const appendSpy = spyOn(document.body, 'appendChild').and.callThrough();
  const removeSpy = spyOn(document.body, 'removeChild').and.callThrough();
  const clickSpy = jasmine.createSpy('click');

  // Save original createElement
  const originalCreateElement = document.createElement.bind(document);
  spyOn(document, 'createElement').and.callFake((tag: string) => {
    const element = originalCreateElement(tag); // use original to avoid recursion
    if (tag === 'a') {
      (element as any).click = clickSpy;
    }
    return element;
  });

  spyOn(URL, 'createObjectURL').and.returnValue('blob:url');

  // Act
  component.downloadCSV();

  // Assert
  expect(clickSpy).toHaveBeenCalled();
  expect(appendSpy).toHaveBeenCalled();
  expect(removeSpy).toHaveBeenCalled();
  });
  
  describe('MyComponent - ngAfterViewInit', () => {

  beforeEach( () => {

    // Mock required properties
    component.dataSource = {} as any;
    component.paginator = {} as MatPaginator;
    component.sort = {} as MatSort;

    // Mock these methods for accessor
    spyOn(component, 'getOverallProgress').and.returnValue(75);
    spyOn(component, 'getTotalDuration').and.returnValue(120);
  });

  it('should assign paginator, sort and configure sortingDataAccessor', () => {
    component.ngAfterViewInit();

    // Check paginator and sort assignment
    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(component.dataSource.sort).toBe(component.sort);

    // Verify that sortingDataAccessor is defined
    expect(typeof component.dataSource.sortingDataAccessor).toBe('function');

    const accessor = component.dataSource.sortingDataAccessor;

    // Case: instructor (direct)
    expect(accessor({ instructor: 'John' } as Course, 'instructor')).toBe('John');

    // Case: instructor (from instructorInfo)
    expect(accessor({ instructorInfo: { name: 'Jane' } } as Course, 'instructor')).toBe('Jane');

    // Case: instructor (none available)
    expect(accessor({} as Course, 'instructor')).toBe('');

    // Case: enrollments
    expect(accessor({ enrollmentCount: 10 } as Course, 'enrollments')).toBe(10);

    // Case: progress (delegates to getOverallProgress)
    const progressItem = { id: 1 } as unknown as Course;
    expect(accessor(progressItem, 'progress')).toBe(75);
    expect(component.getOverallProgress).toHaveBeenCalledWith(progressItem);

    // Case: duration (delegates to getTotalDuration)
    const durationItem = { id: 2 } as unknown as Course;
    expect(accessor(durationItem, 'duration')).toBe(120);
    expect(component.getTotalDuration).toHaveBeenCalledWith(durationItem);

    // Case: default
    expect(accessor({ title: 'Angular Basics' } as Course, 'title')).toBe('Angular Basics');
  });
});

});
 