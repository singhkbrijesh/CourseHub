import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesComponent } from './courses/courses.component';
import { COURSES_ROUTES } from './courses.routes';
import { RouterModule } from '@angular/router';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(COURSES_ROUTES),
    CoursesComponent,
  ]
})
export class CoursesModule { }
