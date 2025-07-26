import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";

export interface ConfirmDialogData {
  title: string;
  message: string;
  requireReason?: boolean; // If true, show textarea for reason
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  imports: [MatDialogModule, MatFormFieldModule, CommonModule, FormsModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  reason: string = '';
  constructor(
    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
  onCancel() { this.dialogRef.close(); }
  onConfirm() { this.dialogRef.close(this.data.requireReason ? this.reason : true); }
}
