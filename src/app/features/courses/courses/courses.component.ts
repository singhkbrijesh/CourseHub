import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';
  
  categories = ['Programming', 'Design', 'Business', 'Marketing'];
  levels = ['Beginner', 'Intermediate', 'Advanced'];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses.filter(c => c.status === 'approved');
      this.filteredCourses = [...this.courses];
    });
  }

  filterCourses() {
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
      const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }

  onSearchChange() {
    this.filterCourses();
  }

  onCategoryChange() {
    this.filterCourses();
  }

  onLevelChange() {
    this.filterCourses();
  }

  enrollInCourse(courseId: string) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'student') {
      this.courseService.enrollInCourse(courseId, user.id).subscribe(() => {
        alert('Successfully enrolled in course!');
      });
    }
  }
}