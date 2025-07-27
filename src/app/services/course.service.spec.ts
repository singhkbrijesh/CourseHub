import { TestBed } from '@angular/core/testing';
import { CourseService } from './course.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoadingService } from './loading.service';
import { Course, Enrollment, User, LoginActivity } from '../core/models/course.model';
import { of } from 'rxjs';

class MockLoadingService {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

fdescribe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;
  let loadingService: MockLoadingService;

  const mockCourse= {
    id: 'c1',
    title: 'Angular',
    description: 'desc',
    category: 'web',
    level: 'beginner',
    instructorId: 'i1',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'approved',
    enrollmentCount: 0,
    rating: 4
  } as unknown as Course;

  const mockEnrollment: Enrollment = {
    id: 'e1',
    studentId: 's1',
    courseId: 'c1',
    enrolledAt: new Date(),
    progress: 0,
    completedLessons: [],
    status: 'active'
  };

  beforeEach(() => {
    loadingService = new MockLoadingService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CourseService,
        { provide: LoadingService, useValue: loadingService }
      ]
    });

    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(console, 'error');

    const initCoursesReq = httpMock.expectOne('api/courses');
    initCoursesReq.flush([]); // empty list or mock data
    const initEnrollmentsReq = httpMock.expectOne('api/enrollments');
    initEnrollmentsReq.flush([]);
  });

//   afterEach(() => {
//     httpMock.verify();
//   });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---- getCourses ----
  it('should fetch courses and update subject', () => {
    service.getCourses().subscribe(courses => {
      expect(courses).toEqual([mockCourse]);
    });

    const req = httpMock.expectOne('api/courses');
    req.flush([mockCourse]);
    expect(loadingService.hide).toHaveBeenCalled();
  });

  // ---- getCourseById ----
  it('should fetch a course by id', () => {
    service.getCourseById('c1').subscribe(course => {
      expect(course).toEqual(mockCourse);
    });
    const req = httpMock.expectOne('api/courses/c1');
    req.flush(mockCourse);
  });

  // ---- createCourse ----
  it('should create a course and update state', () => {
    service.createCourse({ title: 'new' }).subscribe(course => {
      expect(course.title).toBe('Angular');
    });
    const req = httpMock.expectOne('api/courses');
    req.flush(mockCourse);
  });

  // ---- updateCourse ----
  it('should update a course and update state', () => {
    // push initial course
    (service as any).coursesSubject.next([mockCourse]);
    service.updateCourse(mockCourse).subscribe(course => {
      expect(course).toEqual(mockCourse);
    });
    const req = httpMock.expectOne('api/courses');
    req.flush(mockCourse);
  });

  // ---- enrollInCourse success ----
  it('should enroll a student in a course', () => {
    (service as any).enrollmentsSubject.next([]);
    spyOn(service as any, 'updateCourseEnrollmentCount').and.returnValue(of(mockCourse));
    service.enrollInCourse('c1', 's1').subscribe(enrollment => {
      expect(enrollment.courseId).toBe('c1');
    });
    const req = httpMock.expectOne('api/enrollments');
    req.flush(mockEnrollment);
  });

  // ---- enrollInCourse already enrolled ----
  it('should throw error if already enrolled', (done) => {
    (service as any).enrollmentsSubject.next([mockEnrollment]);
    service.enrollInCourse('c1', 's1').subscribe({
      error: (err) => {
        expect(err.message).toContain('Already enrolled');
        done();
      }
    });
  });

  // ---- getEnrollments ----
  it('should fetch enrollments', () => {
    service.getEnrollments().subscribe(enrollments => {
      expect(enrollments).toEqual([mockEnrollment]);
    });
    const req = httpMock.expectOne('api/enrollments');
    req.flush([mockEnrollment]);
  });

  // ---- getStudentEnrollments with cached data ----
  it('should return user enrollments from cache', () => {
    (service as any).enrollmentsSubject.next([mockEnrollment]);
    service.getStudentEnrollments('s1').subscribe(result => {
      expect(result.length).toBe(1);
    });
  });

  // ---- getStudentEnrollments without cache ----
  it('should fetch enrollments when cache is empty', () => {
    (service as any).enrollmentsSubject.next([]);
    spyOn(service, 'getEnrollments').and.returnValue(of([mockEnrollment]));
    service.getStudentEnrollments('s1').subscribe(result => {
      expect(result.length).toBe(1);
    });
  });

  // ---- getCurrentCourses / getCurrentEnrollments / getCurrentUserEnrollments ----
  it('should return current state arrays', () => {
    (service as any).coursesSubject.next([mockCourse]);
    (service as any).enrollmentsSubject.next([mockEnrollment]);
    (service as any).userEnrollmentsSubject.next([mockEnrollment]);
    expect(service.getCurrentCourses()).toEqual([mockCourse]);
    expect(service.getCurrentEnrollments()).toEqual([mockEnrollment]);
    expect(service.getCurrentUserEnrollments()).toEqual([mockEnrollment]);
  });

  // ---- searchCourses ----
  it('should search courses by term', (done) => {
    (service as any).coursesSubject.next([mockCourse]);
    service.searchCourses('angular').subscribe(result => {
      expect(result.length).toBe(1);
      done();
    });
  });

  // ---- getCoursesByCategory ----
  it('should filter courses by category', (done) => {
    (service as any).coursesSubject.next([mockCourse]);
    service.getCoursesByCategory('web').subscribe(result => {
      expect(result.length).toBe(1);
      done();
    });
  });

  // ---- getCoursesByLevel ----
  it('should filter courses by level', (done) => {
    (service as any).coursesSubject.next([mockCourse]);
    service.getCoursesByLevel('beginner').subscribe(result => {
      expect(result.length).toBe(1);
      done();
    });
  });

  // ---- updateEnrollmentProgress ----
  it('should update enrollment progress', () => {
    (service as any).enrollmentsSubject.next([mockEnrollment]);
    service.updateEnrollmentProgress('e1', 100, []).subscribe(result => {
      expect(result.status).toBe('completed');
    });
    const req = httpMock.expectOne('api/enrollments/e1');
    req.flush(mockEnrollment);

    const putReq = httpMock.expectOne('api/enrollments');
    putReq.flush({});
  });

  // ---- getPendingCourses ----
  it('should return pending courses', (done) => {
    (service as any).coursesSubject.next([{ ...mockCourse, status: 'pending' }]);
    service.getPendingCourses().subscribe(result => {
      expect(result.length).toBe(1);
      done();
    });
  });

  // ---- getInstructorCourses ----
  it('should return instructor courses', (done) => {
    (service as any).coursesSubject.next([mockCourse]);
    service.getInstructorCourses('i1').subscribe(result => {
      expect(result.length).toBe(1);
      done();
    });
  });

  // ---- updateCourseEnrollmentCount ----
  it('should update course enrollment count', () => {
    (service as any).coursesSubject.next([mockCourse]);
    service['updateCourseEnrollmentCount']('c1', 1).subscribe(course => {
      expect(course.id).toBe('c1');
    });
    const req = httpMock.expectOne('api/courses');
    req.flush(mockCourse);
  });

  // ---- updateCourseEnrollmentCount when not found ----
  it('should throw error if course not found', (done) => {
    (service as any).coursesSubject.next([]);
    service['updateCourseEnrollmentCount']('c1', 1).subscribe({
      error: (err) => {
        expect(err.message).toContain('Course not found');
        done();
      }
    });
  });

  // ---- handleError ----
  it('should handle error and return fallback', () => {
    const handler = (service as any).handleError('op', []);
    handler('error').subscribe((result: any[]) => {
      expect(result).toEqual([]);
    });
  });

  // ---- deleteCourse ----
  it('should delete course', () => {
    service.deleteCourse('c1').subscribe();
    const req = httpMock.expectOne('api/courses/c1');
    req.flush({});
  });

  // ---- getStudentLoginActivities ----
  it('should filter login activities', () => {
    const loginData: LoginActivity[] = [{ id: '1', studentId: 's1', loginTime: new Date() }];
    service.getStudentLoginActivities('s1').subscribe(result => {
      expect(result.length).toBe(1);
    });
    const req = httpMock.expectOne('api/loginActivities');
    req.flush(loginData);
  });

  // ---- getAllUsers ----
  it('should fetch all users', () => {
    const users: User[] = [{ id: 'u1', name: 'John', email: '', role: 'student' }] as User[];
    service.getAllUsers().subscribe(result => {
      expect(result).toEqual(users);
    });
    const req = httpMock.expectOne('api/users');
    req.flush(users);
  });

  // ---- deleteUser ----
  it('should delete user', () => {
    service.deleteUser('u1').subscribe();
    const req = httpMock.expectOne('api/users/u1');
    req.flush({});
  });

  // ---- deleteEnrollments ----
  it('should delete enrollment', () => {
    service.deleteEnrollments('e1').subscribe();
    const req = httpMock.expectOne('api/enrollments/e1');
    req.flush({});
  });

  // ---- deleteCoursesByInstructor ----
  it('should delete courses by instructor', () => {
    service.deleteCoursesByInstructor('i1').subscribe();
    const req = httpMock.expectOne('api/courses?instructorId=i1');
    req.flush({});
  });
});
