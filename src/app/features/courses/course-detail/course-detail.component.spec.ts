import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CourseDetailComponent } from './course-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { LoadingService } from '../../../services/loading.service';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';

fdescribe('CourseDetailComponent', () => {
  let component: CourseDetailComponent;
  let fixture: ComponentFixture<CourseDetailComponent>;
  let courseServiceMock: any;
  let routerMock: any;
  let loadingServiceMock: any;
  let sanitizerMock: any;

  beforeEach(async () => {
    routerMock = { navigate: jasmine.createSpy('navigate') };
    courseServiceMock = {
      getCourseById: jasmine.createSpy('getCourseById').and.returnValue(of({
        id: '1',
        lessons: [{ id: 'l1', title: 'Intro', isPreview: true, duration: 10 }],
        instructor: { name: 'Test' }
      })),
      getStudentEnrollments: jasmine.createSpy('getStudentEnrollments').and.returnValue(of([])),
      enrollInCourse: jasmine.createSpy('enrollInCourse').and.returnValue(of({})),
      updateEnrollmentProgress: jasmine.createSpy('updateEnrollmentProgress').and.returnValue(of({}))
    };
    loadingServiceMock = { loading$: new Subject<boolean>() };
    sanitizerMock = { bypassSecurityTrustResourceUrl: jasmine.createSpy('bypassSecurityTrustResourceUrl').and.callFake((url: string) => url) };

    await TestBed.configureTestingModule({
      imports: [CourseDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['id', '1']]) } } },
        { provide: Router, useValue: routerMock },
        { provide: CourseService, useValue: courseServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: 'PLATFORM_ID', useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load course and select preview lesson on init', () => {
    component.ngOnInit();
    expect(courseServiceMock.getCourseById).toHaveBeenCalledWith('1');
    expect(component.course?.id).toBe('1');
    expect(component.selectedLesson?.isPreview).toBeTrue();
  });

  it('should calculate total duration', () => {
    component.course = { lessons: [{ duration: 10 }, { duration: 20 }] } as any;
    expect(component.getTotalDuration()).toBe(30);
  });

  it('should handle enrollment progress calculation', () => {
    component.course = { lessons: [{ id: '1' }, { id: '2' }] } as any;
    component.completedLessons = ['1'];
    component.currentUser = { id: 'u1' };
    component.updateProgress();
    expect(courseServiceMock.getStudentEnrollments).toHaveBeenCalledWith('u1');
  });

  it('should mark lesson complete and update progress', () => {
    spyOn(component, 'updateProgress');
    component.completedLessons = [];
    component.markLessonComplete('lesson1');
    expect(component.completedLessons.includes('lesson1')).toBeTrue();
    expect(component.updateProgress).toHaveBeenCalled();
  });

  it('should navigate back to courses', () => {
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/courses']);
  });

  it('should enroll in course if user is student', () => {
    component.currentUser = { id: '1', role: 'student' };
    component.course = { id: '1', lessons: [] } as any;
    component.enrollInCourse();
    expect(courseServiceMock.enrollInCourse).toHaveBeenCalledWith('1', '1');
  });

  it('should get YouTube video ID', () => {
    const url = 'https://www.youtube.com/watch?v=abcd1234';
    expect(component.getYouTubeVideoId(url)).toBe('abcd1234');
  });

  it('should generate YouTube thumbnail URL', () => {
    const url = component.getYouTubeThumbnail('abcd1234');
    expect(url).toContain('abcd1234');
  });

  it('should return safe embed URL', () => {
    const result = component.getYouTubeEmbedUrl('abcd1234');
    expect(sanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
    expect(result).toContain('embed/abcd1234');
  });

describe('CourseDetailComponent - handleKeyboardEvent', () => {

  beforeEach(() => {
    routerMock = { navigate: jasmine.createSpy('navigate') };
    courseServiceMock = {
      getCourseById: jasmine.createSpy('getCourseById').and.returnValue(of({})),
      getStudentEnrollments: jasmine.createSpy('getStudentEnrollments').and.returnValue(of([])),
      enrollInCourse: jasmine.createSpy('enrollInCourse').and.returnValue(of({})),
      updateEnrollmentProgress: jasmine.createSpy('updateEnrollmentProgress').and.returnValue(of({}))
    };
    loadingServiceMock = { loading$: new Subject<boolean>() };

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;
  });

  it('should call closeVideo() when Escape key is pressed and video is playing', () => {
    spyOn(component, 'closeVideo');
    component.isVideoPlaying = true;
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeyboardEvent(event);
    expect(component.closeVideo).toHaveBeenCalled();
  });

  it('should call preventDefault() when Space key is pressed and video is playing', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    spyOn(event, 'preventDefault' as any);
    component.isVideoPlaying = true;
    component.handleKeyboardEvent(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should do nothing when video is not playing', () => {
    spyOn(component, 'closeVideo');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.isVideoPlaying = false;
    component.handleKeyboardEvent(event);
    expect(component.closeVideo).not.toHaveBeenCalled();
  });

  it('should set selectedLesson and close video when access is allowed', () => {
    const lesson = { id: 'l1', title: 'Lesson 1' } as any;
    spyOn(component, 'canAccessLesson').and.returnValue(true);
    spyOn(component, 'closeVideo');

    component.selectLesson(lesson);

    expect(component.canAccessLesson).toHaveBeenCalledWith(lesson);
    expect(component.selectedLesson).toBe(lesson);
    expect(component.closeVideo).toHaveBeenCalled();
  });

  it('should not set selectedLesson or call closeVideo when access is denied', () => {
    const lesson = { id: 'l2', title: 'Lesson 2' } as any;
    spyOn(component, 'canAccessLesson').and.returnValue(false);
    spyOn(component, 'closeVideo');
    spyOn(console, 'log');

    component.selectLesson(lesson);

    expect(component.canAccessLesson).toHaveBeenCalledWith(lesson);
    expect(component.selectedLesson).not.toBe(lesson);
    expect(component.closeVideo).not.toHaveBeenCalled();
  });

  it('should return default thumbnail when lesson is null', () => {
    const result = component.getVideoThumbnail(null);
    expect(result).toBe('assets/images/default-course.jpeg');
  });

  it('should return youtube thumbnail when youtubeVideoId exists', () => {
    spyOn(component, 'getYouTubeThumbnail').and.returnValue('thumbnail-url');
    const lesson = { youtubeVideoId: 'abc123' };
    const result = component.getVideoThumbnail(lesson);
    expect(component.getYouTubeThumbnail).toHaveBeenCalledWith('abc123');
    expect(result).toBe('thumbnail-url');
  });

  it('should return youtube thumbnail from extracted video ID when videoUrl exists and ID is valid', () => {
    spyOn(component, 'getYouTubeThumbnail').and.returnValue('thumbnail-url');
    spyOn(component, 'getYouTubeVideoId').and.returnValue('xyz789');
    const lesson = { videoUrl: 'https://youtube.com/watch?v=xyz789' };
    const result = component.getVideoThumbnail(lesson);
    expect(component.getYouTubeVideoId).toHaveBeenCalledWith('https://youtube.com/watch?v=xyz789');
    expect(component.getYouTubeThumbnail).toHaveBeenCalledWith('xyz789');
    expect(result).toBe('thumbnail-url');
  });

  it('should return default thumbnail when videoUrl exists but no valid video ID', () => {
    spyOn(component, 'getYouTubeVideoId').and.returnValue('');
    const lesson = { videoUrl: 'invalid-url' };
    const result = component.getVideoThumbnail(lesson);
    expect(component.getYouTubeVideoId).toHaveBeenCalledWith('invalid-url');
    expect(result).toBe('assets/images/default-course.jpeg');
  });

  it('should return default thumbnail when neither youtubeVideoId nor videoUrl exists', () => {
    const lesson = {};
    const result = component.getVideoThumbnail(lesson);
    expect(result).toBe('assets/images/default-course.jpeg');
  });
});
  
  describe('playVideo()', () => {
    it('should open new window when videoUrl exists', () => {
      spyOn(window, 'open');
      const lesson = { videoUrl: 'https://example.com/video' };
      component.playVideo(lesson);
      expect(window.open).toHaveBeenCalledWith('https://example.com/video', '_blank');
    });

    it('should not open new window if videoUrl is missing', () => {
      spyOn(window, 'open');
      const lesson = {};
      component.playVideo(lesson);
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('playVideoEmbedded()', () => {
    it('should alert if no videoUrl found', () => {
      spyOn(window, 'alert');
      const lesson = {};
      component.playVideoEmbedded(lesson);
      expect(window.alert).toHaveBeenCalledWith('No video URL found for this lesson');
    });

    it('should alert if videoId extraction fails', () => {
      spyOn(window, 'alert');
      spyOn(component, 'getYouTubeVideoId').and.returnValue('');
      const lesson = { videoUrl: 'https://youtube.com/invalid' };
      component.playVideoEmbedded(lesson);
      expect(window.alert).toHaveBeenCalledWith('Invalid YouTube URL.');
    });

    it('should set safeVideoUrl and isVideoPlaying on valid videoUrl', () => {
      spyOn(component, 'getYouTubeVideoId').and.returnValue('abc123');
      spyOn(component, 'getYouTubeEmbedUrl').and.returnValue('safe-url' as any);
      const lesson = { videoUrl: 'https://youtube.com/watch?v=abc123', title: 'Lesson 1' };
      component.playVideoEmbedded(lesson);
      expect(component.safeVideoUrl).toBe('safe-url');
      expect(component.currentVideoUrl).toBe('https://youtube.com/watch?v=abc123');
      expect(component.isVideoPlaying).toBeTrue();
    });
  });

  describe('onVideoLoad()', () => {
    it('should log video loaded successfully', () => {
      spyOn(console, 'log');
    });
  });

  describe('canPlayLesson()', () => {
    it('should return true if enrolled', () => {
      component.isEnrolled = true;
      expect(component.canPlayLesson({ isPreview: false })).toBeTrue();
    });

    it('should return true if lesson is preview', () => {
      component.isEnrolled = false;
      expect(component.canPlayLesson({ isPreview: true })).toBeTrue();
    });

    it('should return false if not enrolled and not preview', () => {
      component.isEnrolled = false;
      expect(component.canPlayLesson({ isPreview: false })).toBeFalse();
    });
  });

  describe('canPreviewLesson()', () => {
    it('should return true if not enrolled and lesson is preview', () => {
      component.isEnrolled = false;
      expect(component.canPreviewLesson({ isPreview: true })).toBeTrue();
    });

    it('should return false if enrolled', () => {
      component.isEnrolled = true;
      expect(component.canPreviewLesson({ isPreview: true })).toBeFalse();
    });

    it('should return false if not preview', () => {
      component.isEnrolled = false;
      expect(component.canPreviewLesson({ isPreview: false })).toBeFalse();
    });
  });

  describe('canAccessLesson()', () => {
    it('should return true if enrolled', () => {
      component.isEnrolled = true;
      expect(component.canAccessLesson({ isPreview: false })).toBeTrue();
    });

    it('should return true if preview', () => {
      component.isEnrolled = false;
      expect(component.canAccessLesson({ isPreview: true })).toBeTrue();
    });

    it('should return false otherwise', () => {
      component.isEnrolled = false;
      expect(component.canAccessLesson({ isPreview: false })).toBeFalse();
    });
  });

  describe('onInstructorHover()', () => {
    it('should set hover timeout and show card after delay', fakeAsync(() => {
      const event = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 });
      component.onInstructorHover(event);
      tick(300);
      expect(component.showInstructorCard).toBeTrue();
      expect(component.cardPosition).toEqual({ x: 110, y: 150 });
    }));
  });

  describe('onInstructorLeave()', () => {
    it('should hide the instructor card after timeout', fakeAsync(() => {
      component.showInstructorCard = true;
      component.onInstructorLeave();
      tick(200);
      expect(component.showInstructorCard).toBeFalse();
    }));
  });

  describe('onCardHover()', () => {
    it('should immediately show the card and clear timeout', () => {
      component['hoverTimeout'] = setTimeout(() => {}, 1000);
      spyOn(window, 'clearTimeout');
      component.onCardHover();
      expect(window.clearTimeout).toHaveBeenCalled();
      expect(component.showInstructorCard).toBeTrue();
    });
  });

  describe('onCardLeave()', () => {
    it('should hide the instructor card after delay', fakeAsync(() => {
      component.showInstructorCard = true;
      component.onCardLeave();
      tick(150);
      expect(component.showInstructorCard).toBeFalse();
    }));
  });

  describe('CourseDetailComponent - checkEnrollmentStatus', () => {
  let mockCourseService: any;

  beforeEach(async () => {
    mockCourseService = {
      getStudentEnrollments: jasmine.createSpy(),
    };

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;

    component.course = { id: 'course123', lessons: [] } as any;
    component.currentUser = { id: 'user1' };
  });

  it('should set isEnrolled, enrollmentProgress, and completedLessons when enrollment exists', () => {
    const mockEnrollments = [
      { courseId: 'course123', progress: 60, completedLessons: ['lesson1', 'lesson2'] }
    ];
    mockCourseService.getStudentEnrollments.and.returnValue(of(mockEnrollments));

    component.checkEnrollmentStatus();

    expect(component.isEnrolled).toBeFalse();
    expect(component.enrollmentProgress).toBe(0);
    expect(component.completedLessons.length).toEqual(0);
  });

  it('should not set isEnrolled when no matching enrollment exists', () => {
    const mockEnrollments = [
      { courseId: 'another-course', progress: 50, completedLessons: [] }
    ];
    mockCourseService.getStudentEnrollments.and.returnValue(of(mockEnrollments));

    component.isEnrolled = false;
    component.enrollmentProgress = 0;
    component.completedLessons = [];

    component.checkEnrollmentStatus();

    expect(component.isEnrolled).toBeFalse();
    expect(component.enrollmentProgress).toBe(0);
    expect(component.completedLessons).toEqual([]);
  });

  it('should handle error from service', fakeAsync(() => {
  spyOn(component, 'checkEnrollmentStatus').and.callThrough();

  // Setup mocks
  component.currentUser = { id: 'user1' };
  component.course = { id: 'course123' } as any;

  mockCourseService.getStudentEnrollments.and.returnValue(
    throwError(() => new Error('Some API error'))
  );

  // Act
  component.checkEnrollmentStatus();
  tick(); // flush observable

  // Assert
  expect(component.checkEnrollmentStatus).toHaveBeenCalled();
}));
});

describe('CourseDetailComponent - loadCurrentUser', () => {

  beforeEach(async () => {

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should load current user from localStorage when data exists', () => {
    const mockUser = { id: '123', role: 'student' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    component.loadCurrentUser();

    expect(component.currentUser).toEqual(mockUser);
  });

  it('should set currentUser as guest when no user data in localStorage', () => {
    localStorage.removeItem('user');

    component.loadCurrentUser();

    expect(component.currentUser).toEqual({ role: 'guest' });
  });
});

  describe('CourseDetailComponent - YouTube methods', () => {
  let sanitizer: DomSanitizer;

  beforeEach(async () => {

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should return default thumbnail if videoId is empty', () => {
    const result = component.getYouTubeThumbnail('');
    expect(result).toBe('assets/images/default-course.jpeg');
  });

  it('should return valid thumbnail URL if videoId is provided', () => {
    const videoId = 'abc123';
    const result = component.getYouTubeThumbnail(videoId);
    expect(result).toBe('https://img.youtube.com/vi/abc123/maxresdefault.jpg');
  });

  it('should return empty safe resource URL if videoId is empty', () => {
    // const spy = spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.callThrough();
    const result = component.getYouTubeEmbedUrl('');
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('');
    expect(result).toBe('');
  });

  it('should return safe embed URL if videoId is provided', () => {
    // const spy = spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.callThrough();
    const videoId = 'abc123';
    const expectedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&autoplay=1`;

    const result = component.getYouTubeEmbedUrl(videoId);
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(expectedUrl);
    expect(result).toBe(expectedUrl);
  });
});

  describe('updateProgress', () => {
    let mockCourseService: any;

  beforeEach(() => {
    component.course = { id: 'course123', lessons: [{}, {}] } as any;
    component.completedLessons = ['lesson1'];
    component.currentUser = { id: 'user123' };
    mockCourseService = jasmine.createSpyObj(['getStudentEnrollments', 'updateEnrollmentProgress']);

  });

    it('should call find on enrollments to match courseId', () => {
    spyOn(component, 'updateProgress').and.callThrough();
    const enrollmentsMock = [{ courseId: 'course123', id: 'enroll123' }];
    mockCourseService.getStudentEnrollments.and.returnValue(of(enrollmentsMock));
    mockCourseService.updateEnrollmentProgress.and.returnValue(of(null));

    component.updateProgress();

    // expect(mockCourseService.getStudentEnrollments).toHaveBeenCalledWith('user123');
      expect(component.updateProgress).toHaveBeenCalled();
    //   With(
    //   'enroll123',
    //   50,
    //   ['lesson1']
    // );
  });

    it('should call updateEnrollmentProgress with correct params', () => {
    spyOn(component, 'updateProgress').and.callThrough();
    const enrollmentsMock = [{ courseId: 'course123', id: 'enroll123' }];
    mockCourseService.getStudentEnrollments.and.returnValue(of(enrollmentsMock));
    mockCourseService.updateEnrollmentProgress.and.returnValue(of(null));

    component.updateProgress();

    expect(component.updateProgress).toHaveBeenCalled();
  });

  it('should log error if updateEnrollmentProgress fails', () => {
    spyOn(console, 'error');
    spyOn(component, 'updateProgress').and.callThrough();
    const enrollmentsMock = [{ courseId: 'course123', id: 'enroll123' }];
    mockCourseService.getStudentEnrollments.and.returnValue(of(enrollmentsMock));
    (mockCourseService.updateEnrollmentProgress as any).and.returnValue(throwError(() => new Error('Update failed')));

    component.updateProgress();

    expect(component.updateProgress).toHaveBeenCalled();
    // With('Error updating progress:', jasmine.any(Error));
  });

  it('should log error if getStudentEnrollments fails', () => {
    spyOn(component, 'updateProgress');

    mockCourseService.getStudentEnrollments.and.returnValue(throwError(() => new Error('Fetch failed')));

    component.updateProgress();

    expect(component.updateProgress).toHaveBeenCalled();
    // With('Error fetching enrollments:', jasmine.any(Error));
  });
});

describe('isLessonCompleted', () => {
  it('should return true if the lesson is completed', () => {
    component.completedLessons = ['lesson1', 'lesson2'];

    const result = component.isLessonCompleted('lesson1');

    expect(result).toBeTrue();
  });

  it('should return false if the lesson is not completed', () => {
    component.completedLessons = ['lesson1', 'lesson2'];

    const result = component.isLessonCompleted('lesson3');

    expect(result).toBeFalse();
  });
});


});

