import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isSliderOpen: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onClose() {
    this.closeSidebar.emit();
  }
}