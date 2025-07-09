export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    instructorId: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: number; // in hours
    price: number;
    rating: number;
    enrollmentCount: number;
    thumbnail: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    lessons: Lesson[];
  }
  
  export interface Lesson {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number; // in minutes
    order: number;
    isCompleted?: boolean;
  }
  
  export interface Enrollment {
    id: string;
    studentId: string;
    courseId: string;
    enrolledAt: Date;
    progress: number; // 0-100
    completedLessons: string[];
    status: 'active' | 'completed' | 'dropped';
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'instructor' | 'student';
    createdAt: Date;
    isActive: boolean;
  }