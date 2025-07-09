import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course, Lesson } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  selectedLesson: Lesson | null = null;
  currentUser: any = {};
  isEnrolled = false;
  enrollmentProgress = 0;
  completedLessons: string[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadCourse();
  }

  loadCurrentUser() {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      this.currentUser = userData ? JSON.parse(userData) : {};
    } else {
      this.currentUser = {}; // Server fallback
    }
  }

  loadCourse() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.courseService.getCourseById(courseId).subscribe(course => {
        if (course) {
          this.course = course;
          this.selectedLesson = course.lessons[0] || null;
          this.checkEnrollmentStatus();
        } else {
          this.router.navigate(['/courses']);
        }
        this.loading = false;
      });
    }
  }

  checkEnrollmentStatus() {
    if (this.currentUser.role === 'student' && this.course) {
      this.courseService.getStudentEnrollments(this.currentUser.id || 'student1').subscribe(enrollments => {
        const enrollment = enrollments.find(e => e.courseId === this.course?.id);
        if (enrollment) {
          this.isEnrolled = true;
          this.enrollmentProgress = enrollment.progress;
          this.completedLessons = enrollment.completedLessons;
        }
      });
    }
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson = lesson;
  }

  enrollInCourse() {
    if (this.course && this.currentUser.role === 'student') {
      this.courseService.enrollInCourse(this.course.id, this.currentUser.id || 'student1').subscribe(() => {
        this.isEnrolled = true;
        this.enrollmentProgress = 0;
        this.completedLessons = [];
        
        if (isPlatformBrowser(this.platformId)) {
          alert('Successfully enrolled in course!');
        }
      });
    }
  }

  markLessonComplete(lessonId: string) {
    if (!this.completedLessons.includes(lessonId)) {
      this.completedLessons.push(lessonId);
      this.updateProgress();
    }
  }

  updateProgress() {
    if (this.course) {
      const totalLessons = this.course.lessons.length;
      const completedCount = this.completedLessons.length;
      this.enrollmentProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      // Update enrollment in service
      this.courseService.getStudentEnrollments(this.currentUser.id || 'student1').subscribe(enrollments => {
        const enrollment = enrollments.find(e => e.courseId === this.course?.id);
        if (enrollment) {
          this.courseService.updateEnrollmentProgress(
            enrollment.id, 
            this.enrollmentProgress, 
            this.completedLessons
          ).subscribe();
        }
      });
    }
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessons.includes(lessonId);
  }

  goBack() {
    this.router.navigate(['/courses']);
  }
}