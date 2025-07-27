import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AsyncValidatorsService } from './async-validators.service';
import { FormControl } from '@angular/forms';

fdescribe('AsyncValidatorsService', () => {
  let service: AsyncValidatorsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AsyncValidatorsService]
    });

    service = TestBed.inject(AsyncValidatorsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return null if control value is empty', fakeAsync(() => {
    const validatorFn = service.uniqueCourseTitle();
    const control = new FormControl('');
    let result: any;

    const validatorResult = validatorFn(control);
    if (validatorResult && typeof (validatorResult as any).subscribe === 'function') {
      (validatorResult as any).subscribe((res: any) => result = res);
    } else if (validatorResult && typeof (validatorResult as any).then === 'function') {
      (validatorResult as any).then((res: any) => result = res);
      tick(); // For promise resolution in fakeAsync
    }
    tick(); // simulate async

    expect(result).toBeNull();
  }));

  it('should return null if control value length is less than 3', fakeAsync(() => {
    const validatorFn = service.uniqueCourseTitle();
    const control = new FormControl('ab');
    let result: any;

    const validatorResult = validatorFn(control);
    if (validatorResult && typeof (validatorResult as any).subscribe === 'function') {
      (validatorResult as any).subscribe((res: any) => result = res);
    } else if (validatorResult && typeof (validatorResult as any).then === 'function') {
      (validatorResult as any).then((res: any) => result = res);
      tick(); // For promise resolution in fakeAsync
    }
    tick();

    expect(result).toBeNull();
  }));

  it('should return error object if title already exists', fakeAsync(() => {
    const validatorFn = service.uniqueCourseTitle();
    const control = new FormControl('Angular Basics');
    let result: any;

    const validatorResult = validatorFn(control);
    if (validatorResult && typeof (validatorResult as any).subscribe === 'function') {
      (validatorResult as any).subscribe((res: any) => result = res);
    } else if (validatorResult && typeof (validatorResult as any).then === 'function') {
      (validatorResult as any).then((res: any) => result = res);
      tick(); // For promise resolution in fakeAsync
    }

    // Wait for debounce timer (500ms)
    tick(500);

    const req = httpMock.expectOne('api/courses');
    req.flush([
      { title: 'Angular Basics' },
      { title: 'Other Course' }
    ]);

    expect(result).toEqual({
      courseTitleExists: { value: 'Angular Basics' }
    });
  }));

  it('should return null if title does not exist', fakeAsync(() => {
    const validatorFn = service.uniqueCourseTitle();
    const control = new FormControl('React Basics');
    let result: any;

    const validatorResult = validatorFn(control);
    if (validatorResult && typeof (validatorResult as any).subscribe === 'function') {
      (validatorResult as any).subscribe((res: any) => result = res);
    } else if (validatorResult && typeof (validatorResult as any).then === 'function') {
      (validatorResult as any).then((res: any) => result = res);
      tick(); // For promise resolution in fakeAsync
    }

    tick(500);

    const req = httpMock.expectOne('api/courses');
    req.flush([
      { title: 'Angular Basics' },
      { title: 'Other Course' }
    ]);

    expect(result).toBeNull();
  }));

  it('should return null if http call errors (catchError)', fakeAsync(() => {
    const validatorFn = service.uniqueCourseTitle();
    const control = new FormControl('Vue Basics');
    let result: any;

    const validatorResult = validatorFn(control);
    if (validatorResult && typeof (validatorResult as any).subscribe === 'function') {
      (validatorResult as any).subscribe((res: any) => result = res);
    } else if (validatorResult && typeof (validatorResult as any).then === 'function') {
      (validatorResult as any).then((res: any) => result = res);
      tick(); // For promise resolution in fakeAsync
    }

    tick(500);

    const req = httpMock.expectOne('api/courses');
    req.error(new ErrorEvent('Network error'));

    expect(result).toBeNull();
  }));
});
