import { TestBed } from '@angular/core/testing';
import { InMemoryDataService } from './in-memory-data.service';

fdescribe('InMemoryDataService', () => {
  let service: InMemoryDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InMemoryDataService]
    });
    service = TestBed.inject(InMemoryDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create the database with expected collections', () => {
    const db = service.createDb();
    expect(db.courses).toBeDefined();
    expect(db.enrollments).toBeDefined();
    expect(db.users).toBeDefined();
    expect(db.instructorStats).toBeDefined();
    expect(db.loginActivities).toBeDefined();
    expect(Array.isArray(db.courses)).toBeTrue();
    expect(Array.isArray(db.enrollments)).toBeTrue();
    expect(Array.isArray(db.users)).toBeTrue();
  });

  it('should update a course in put method', (done) => {
    // Arrange
    const db = service.createDb();
    const course = db.courses[0];
    const updatedCourse = { ...course, title: 'Updated Title' };
    const reqInfo = {
      collectionName: 'courses',
      collection: db.courses,
      id: course.id,
      req: { body: updatedCourse },
      utils: {
        createResponse$: (fn: any) => {
          const response = fn();
          expect(response.body.title).toBe('Updated Title');
          expect(response.status).toBe(200);
          done();
        }
      }
    };

    // Act
    service.put(reqInfo);
  });

  it('should return undefined for non-courses collection in put', () => {
    const reqInfo = {
      collectionName: 'users',
      collection: [],
      id: 'someid',
      req: { body: {} },
      utils: { createResponse$: () => {} }
    };
    expect(service.put(reqInfo)).toBeUndefined();
  });
});