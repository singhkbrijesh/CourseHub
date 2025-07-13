import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { LoadingService } from '../../../services/loading.service';
import { Course, Lesson } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  selectedLesson: Lesson | null = null;
  loading = false;
  isEnrolled = false;
  enrollmentProgress = 0;
  completedLessons: string[] = [];
  currentUser: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Subscribe to loading service
    this.loadingService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadCourse();
  }

  loadCurrentUser() {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      } else {
        this.currentUser = { role: 'guest' };
      }
    }
  }

  loadCourse() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.courseService.getCourseById(courseId).subscribe({
        next: (course) => {
          if (course) {
            this.course = course;
            this.selectedLesson = course.lessons?.find(l => l.isPreview) || course.lessons?.[0] || null;
            this.checkEnrollmentStatus();
          }
        },
        error: (error) => {
          console.error('Error loading course:', error);
        }
      });
    }
  }

  refreshCourseData() {
    if (this.course) {
      this.courseService.getCourseById(this.course.id).subscribe({
        next: (course) => {
          if (course) {
            this.course = course;
            this.checkEnrollmentStatus();
          }
        },
        error: (error) => {
          console.error('Error refreshing course data:', error);
        }
      });
    }
  }

  checkEnrollmentStatus() {
    if (this.currentUser.id && this.course) {
      this.courseService.getStudentEnrollments(this.currentUser.id).subscribe({
        next: (enrollments) => {
          const enrollment = enrollments.find(e => e.courseId === this.course?.id);
          if (enrollment) {
            this.isEnrolled = true;
            this.enrollmentProgress = enrollment.progress || 0;
            this.completedLessons = enrollment.completedLessons || [];
          }
        },
        error: (error) => {
          console.error('Error checking enrollment:', error);
        }
      });
    }
  }

  getTotalDuration(): number {
    if (!this.course || !this.course.lessons) return 0;
    return this.course.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }

  selectLesson(lesson: Lesson) {
    if (this.canAccessLesson(lesson)) {
      this.selectedLesson = lesson;
    } else {
      if (isPlatformBrowser(this.platformId)) {
        console.log('Lesson not accessible');
      }
    }
  }

  enrollInCourse() {
    if (this.course && this.currentUser.role === 'student') {
      this.courseService.enrollInCourse(this.course.id, this.currentUser.id).subscribe({
        next: () => {
          this.isEnrolled = true;
          this.enrollmentProgress = 0;
          this.completedLessons = [];
          
          this.refreshCourseData();
          
          if (isPlatformBrowser(this.platformId)) {
            alert('Successfully enrolled in course!');
          }
        },
        error: (error) => {
          console.error('Error enrolling in course:', error);
          if (isPlatformBrowser(this.platformId)) {
            if (error.message === 'Already enrolled in this course') {
              alert('You are already enrolled in this course!');
            } else {
              alert('Failed to enroll in course. Please try again.');
            }
          }
        }
      });
    } else if (this.currentUser.role !== 'student') {
      if (isPlatformBrowser(this.platformId)) {
        alert('Only students can enroll in courses.');
      }
    }
  }

  markLessonComplete(lessonId: string) {
    if (!this.completedLessons.includes(lessonId)) {
      this.completedLessons.push(lessonId);
      this.updateProgress();
    }
  }

  updateProgress() {
    if (this.course && this.course.lessons) {
      const totalLessons = this.course.lessons.length;
      const completedCount = this.completedLessons.length;
      this.enrollmentProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      if (this.currentUser.id) {
        this.courseService.getStudentEnrollments(this.currentUser.id).subscribe({
          next: (enrollments) => {
            const enrollment = enrollments.find(e => e.courseId === this.course?.id);
            if (enrollment) {
              this.courseService.updateEnrollmentProgress(
                enrollment.id, 
                this.enrollmentProgress, 
                this.completedLessons
              ).subscribe({
                next: () => {
                  console.log('Progress updated successfully');
                },
                error: (error) => {
                  console.error('Error updating progress:', error);
                }
              });
            }
          },
          error: (error) => {
            console.error('Error fetching enrollments:', error);
          }
        });
      }
    }
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessons.includes(lessonId);
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  // Video-related methods
  getYouTubeVideoId(url: string): string {
    if (!url) return '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  getYouTubeThumbnail(videoId: string): string {
    if (!videoId) return 'assets/images/defaultcourse.jpeg';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  getYouTubeEmbedUrl(videoId: string): string {
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  getVideoThumbnail(lesson: any): string {
    if (!lesson) return 'assets/images/defaultcourse.jpeg';
    
    if (lesson.youtubeVideoId) {
      return this.getYouTubeThumbnail(lesson.youtubeVideoId);
    } else if (lesson.videoUrl) {
      const videoId = this.getYouTubeVideoId(lesson.videoUrl);
      return videoId ? this.getYouTubeThumbnail(videoId) : 'assets/images/defaultcourse.jpeg';
    }
    
    return 'assets/images/defaultcourse.jpeg';
  }

  playVideo(lesson: any) {
    if (lesson.videoUrl && isPlatformBrowser(this.platformId)) {
      window.open(lesson.videoUrl, '_blank');
    }
  }

  previewVideo(lesson: any) {
    if (lesson.videoUrl && isPlatformBrowser(this.platformId)) {
      window.open(lesson.videoUrl, '_blank');
    }
  }

  // Check if user can play lesson (enrolled users)
  canPlayLesson(lesson: any): boolean {
    return this.isEnrolled || lesson.isPreview;
  }

  // Check if user can preview lesson (non-enrolled users)
  canPreviewLesson(lesson: any): boolean {
    return lesson.isPreview && !this.isEnrolled;
  }

  // Check if user can access lesson at all
  canAccessLesson(lesson: any): boolean {
    return this.isEnrolled || lesson.isPreview;
  }
}