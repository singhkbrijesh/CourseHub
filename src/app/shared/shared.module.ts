import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HasRoleDirective } from './has-role.directive';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HasRoleDirective
  ],
  exports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    HasRoleDirective
  ]
})
export class SharedModule { }
