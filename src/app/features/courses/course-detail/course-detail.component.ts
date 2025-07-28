import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { LoadingService } from '../../../services/loading.service';
import { Course, Lesson } from '../../../core/models/course.model';
import { InstructorInfoCardComponent } from "../instructor-info-card/instructor-info-card.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, InstructorInfoCardComponent, MatIcon],
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

  showPdf = false;
  safePdfUrl: SafeResourceUrl | null = null;
  
  isVideoPlaying = false;
  currentVideoUrl = '';
  safeVideoUrl: SafeResourceUrl | null = null;

  showInstructorCard = false;
  cardPosition = { x: 0, y: 0 };
  private hoverTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private loadingService: LoadingService,
    private sanitizer: DomSanitizer,
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isVideoPlaying) {
      switch (event.key) {
        case 'Escape':
          this.closeVideo();
          break;
        case ' ':
          // Space bar to pause/play (YouTube handles this)
          event.preventDefault();
          break;
      }
    }
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
      this.closeVideo(); // Close current video when switching lessons
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
    
    // Close the current video when marked as complete
    this.closeVideo();
    
    // Update progress without refreshing the page
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
  
  // Handle different YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
}

  getYouTubeThumbnail(videoId: string): string {
    if (!videoId) return 'assets/images/default-course.jpeg';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  getYouTubeEmbedUrl(videoId: string): SafeResourceUrl {
    if (!videoId) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    const url = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getVideoThumbnail(lesson: any): string {
    if (!lesson) return 'assets/images/default-course.jpeg';
    
    if (lesson.youtubeVideoId) {
      return this.getYouTubeThumbnail(lesson.youtubeVideoId);
    } else if (lesson.videoUrl) {
      const videoId = this.getYouTubeVideoId(lesson.videoUrl);
      return videoId ? this.getYouTubeThumbnail(videoId) : 'assets/images/default-course.jpeg';
    }
    
    return 'assets/images/default-course.jpeg';
  }

  playVideo(lesson: any) {
    if (lesson.videoUrl && isPlatformBrowser(this.platformId)) {
      window.open(lesson.videoUrl, '_blank');
    }
  }

  playVideoEmbedded(lesson: any) {
  if (!lesson.videoUrl) {
    if (isPlatformBrowser(this.platformId)) {
      alert('No video URL found for this lesson');
    }
    return;
  }
  
  const videoId = this.getYouTubeVideoId(lesson.videoUrl);
  if (!videoId) {
    if (isPlatformBrowser(this.platformId)) {
      alert('Invalid YouTube URL.');
    }
    return;
  }
  
  // Create safe URL and play immediately
  this.safeVideoUrl = this.getYouTubeEmbedUrl(videoId);
  this.currentVideoUrl = lesson.videoUrl;
  this.isVideoPlaying = true;
  }
  
  togglePdf() {
    this.showPdf = !this.showPdf;
    if (this.showPdf && this.selectedLesson?.pdfUrl) {
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedLesson.pdfUrl);
    } else {
      this.safePdfUrl = null;
    }
  }

  closeVideo() {
    this.isVideoPlaying = false;
    this.currentVideoUrl = '';
    this.safeVideoUrl = null; // Reset safe URL
    
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const lessonElement = document.querySelector('.lesson-info-section');
        if (lessonElement) {
          lessonElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }
      }, 100);
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

  onInstructorHover(event: MouseEvent) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    this.hoverTimeout = setTimeout(() => {
      this.cardPosition = {
        x: event.clientX + 10,
        y: event.clientY - 50
      };
      this.showInstructorCard = true;
    }, 300);
  }

  onInstructorLeave() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    // Increase delay to allow user to move to the card
    this.hoverTimeout = setTimeout(() => {
      if (!this.showInstructorCard) return; // Don't hide if already hidden
      this.showInstructorCard = false;
    }, 200);
  }

  onCardHover() {
    // Clear any pending hide timeout when hovering over the card
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.showInstructorCard = true;
  }

  onCardLeave() {
    // Hide card after a short delay when leaving the card
    this.hoverTimeout = setTimeout(() => {
      this.showInstructorCard = false;
    }, 150);
  }
}