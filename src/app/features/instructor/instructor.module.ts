import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorComponent } from './instructor/instructor.component';
import { RouterModule } from '@angular/router';
import { INSTRUCTOR_ROUTES } from './instructor.routes';



@NgModule({
  imports: [
    CommonModule,
    InstructorComponent,
    RouterModule.forChild(INSTRUCTOR_ROUTES),
  ]
})
export class InstructorModule { }
