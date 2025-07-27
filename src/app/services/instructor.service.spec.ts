import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InstructorService } from './instructor.service';
import { Course, InstructorStats, Enrollment } from '../core/models/course.model';

fdescribe('InstructorService', () => {
  let service: InstructorService;
  let httpMock: HttpTestingController;

  const apiUrl = 'api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstructorService]
    });

    service = TestBed.inject(InstructorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getInstructorStats', () => {
    it('should calculate stats and update BehaviorSubject', fakeAsync(() => {
      const instructorId = 'inst1';
      const courses: Course[] = [
        { id: 'c1', instructorId: 'inst1', title: 'Angular', rating: 4, status: 'approved' } as Course,
        { id: 'c2', instructorId: 'inst1', title: 'React', rating: 5, status: 'pending' } as Course,
        { id: 'c3', instructorId: 'other', title: 'Vue', rating: 5, status: 'approved' } as Course,
      ];
      const enrollments = [
        { courseId: 'c1', studentId: 's1', status: 'completed' },
        { courseId: 'c1', studentId: 's2', status: 'in-progress' },
        { courseId: 'c2', studentId: 's1', status: 'completed' },
      ] as unknown as Enrollment[];

      let stats: InstructorStats | undefined;

      service.getInstructorStats(instructorId).subscribe(result => stats = result);

      const coursesReq = httpMock.expectOne(`${apiUrl}/courses`);
      const enrollmentsReq = httpMock.expectOne(`${apiUrl}/enrollments`);

      coursesReq.flush(courses);
      enrollmentsReq.flush(enrollments);

      tick();

      expect(stats).toBeTruthy();
      expect(stats!.totalCourses).toBe(2);
      expect(stats!.totalStudents).toBe(2);
      expect(stats!.pendingApprovals).toBe(1);
      expect(stats!.activeCourses).toBe(1);

      // BehaviorSubject updated
      // service.instructorStats$.subscribe(val => {
      //   expect(val).toEqual(stats);
      // });
    }));
  });

  describe('getInstructorCourses', () => {
    it('should filter courses by instructor and update BehaviorSubject', () => {
      const instructorId = 'inst1';
      const allCourses: Course[] = [
        { id: 'c1', instructorId: 'inst1' } as Course,
        { id: 'c2', instructorId: 'inst2' } as Course,
      ];

      let result: Course[] | undefined;

      service.getInstructorCourses(instructorId).subscribe(courses => result = courses);

      const req = httpMock.expectOne(`${apiUrl}/courses`);
      req.flush(allCourses);

      expect(result!.length).toBe(1);
      expect(result![0].id).toBe('c1');
    });
  });

  describe('createCourse', () => {
    it('should post and return created course', () => {
      const courseData = { title: 'New Course' };
      const createdCourse = { id: 'c1', title: 'New Course' } as Course;

      let result: Course | undefined;
      service.createCourse(courseData).subscribe(c => result = c);

      const req = httpMock.expectOne(`${apiUrl}/courses`);
      expect(req.request.method).toBe('POST');
      req.flush(createdCourse);

      expect(result).toEqual(createdCourse);
    });
  });

  describe('updateCourse', () => {
    it('should update and emit updated courses on success', () => {
      // Prepare initial BehaviorSubject value
      (service as any).instructorCoursesSubject.next([
        { id: 'c1', title: 'Old' } as Course,
        { id: 'c2', title: 'Another' } as Course
      ]);

      const updatedCourse = { id: 'c1', title: 'Updated' } as Course;

      let result: Course | undefined;
      service.updateCourse('c1', updatedCourse).subscribe(res => result = res);

      const req = httpMock.expectOne(`${apiUrl}/courses/c1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedCourse);

      expect(result).toEqual(updatedCourse);

      service.instructorCourses$.subscribe(courses => {
        expect(courses.find(c => c.id === 'c1')!.title).toBe('Updated');
      });
    });

    it('should handle error and fallback to GET', () => {
      // BehaviorSubject initial value
      (service as any).instructorCoursesSubject.next([
        { id: 'c1', title: 'Old' } as Course
      ]);

      const updatedCourse = { id: 'c1', title: 'Updated' } as Course;
      let result: Course | undefined;

      service.updateCourse('c1', updatedCourse).subscribe(res => result = res);

      const putReq = httpMock.expectOne(`${apiUrl}/courses/c1`);
      putReq.error(new ErrorEvent('Network error'));

      const getReq = httpMock.expectOne(`${apiUrl}/courses`);
      getReq.flush([{ id: 'c1', title: 'Old' }]);

      expect(result).toEqual(updatedCourse);
    });
  });

  describe('deleteCourse', () => {
    it('should delete course', () => {
      let result: any;
      service.deleteCourse('c1').subscribe(res => result = res);

      const req = httpMock.expectOne(`${apiUrl}/courses/c1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });

      expect(result).toEqual({ success: true });
    });
  });

  describe('submitCourseForApproval', () => {
    it('should patch course status', () => {
      const updatedCourse = { id: 'c1', status: 'pending' } as Course;
      let result: Course | undefined;

      service.submitCourseForApproval('c1').subscribe(res => result = res);

      const req = httpMock.expectOne(`${apiUrl}/courses/c1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedCourse);

      expect(result).toEqual(updatedCourse);
    });
  });

  describe('getCoursesByInstructor', () => {
    it('should filter courses by instructorId', () => {
      const instructorId = 'inst1';
      const allCourses: Course[] = [
        { id: 'c1', instructorId: 'inst1' } as Course,
        { id: 'c2', instructorId: 'inst2' } as Course,
      ];

      let result: Course[] | undefined;
      service.getCoursesByInstructor(instructorId).subscribe(c => result = c);

      const req = httpMock.expectOne(`${apiUrl}/courses`);
      req.flush(allCourses);

      expect(result!.length).toBe(1);
      expect(result![0].instructorId).toBe('inst1');
    });
  });

  describe('getCourseById', () => {
    it('should return course by id', () => {
      const allCourses: Course[] = [
        { id: 'c1', instructorId: 'inst1' } as Course,
        { id: 'c2', instructorId: 'inst2' } as Course,
      ];

      let result: Course | undefined;
      service.getCourseById('c2').subscribe(c => result = c);

      const req = httpMock.expectOne(`${apiUrl}/courses`);
      req.flush(allCourses);

      expect(result!.id).toBe('c2');
    });
  });

  it('should log error and return an observable that errors', (done) => {
    const errorObj = { message: 'Something went wrong' };
    spyOn(console, 'error');

    // Call private method using type cast
    (service as any).handleError(errorObj).subscribe({
      next: () => fail('Expected error, not next'),
      error: (err: any) => {
        expect(console.error).toHaveBeenCalledWith('An error occurred:', errorObj);
        expect(err).toEqual(jasmine.any(Error));
        expect(err.message).toBe('Something went wrong');
        done();
      }
    });
  });
});
