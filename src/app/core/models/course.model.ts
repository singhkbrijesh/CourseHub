export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId?: string;
  instructorInfo?: {
    name: string;
    title: string;
    rating: number;
    totalReviews: number;
    totalStudents: number;
    totalCourses: number;
    bio: string;
    avatar?: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  thumbnail: string;
  rating: number;
  enrollmentCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  lessons: Lesson[];
  requirements?: string[];
  learningOutcomes?: string[];
  tags?: string[];
  prerequisiteCourses?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl?: string; // Full YouTube URL
  youtubeVideoId?: string; // Extracted YouTube video ID for easier handling
  isPreview?: boolean;
  content?: string;
  resources?: string[];
  order?: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  completedLessons: string[];
}
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'instructor' | 'student';
    createdAt: Date;
    isActive: boolean;
  }