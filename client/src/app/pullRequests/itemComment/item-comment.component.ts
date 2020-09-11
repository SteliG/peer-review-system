import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { SubmitComment } from 'src/app/models/submit-comment';

@Component({
  selector: 'item-comment',
  templateUrl: './item-comment.component.html',
  styleUrls: ['./item-comment.component.css']
})
export class ItemComment implements OnInit {
  public commentValue: string;
  public radioGroupForm: FormGroup;
  public sendReviewForm: FormGroup;
  @Input()
  public isReviewer = true;
  @Output() commentEmiter = new EventEmitter<SubmitComment>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.sendReviewForm = this.formBuilder.group({
      content: ['', [Validators.required]],
      status: ['comment', [Validators.required]]
    });
  }

  /**
   * Gets the form controls of the form
   */
  get formControls(): { [key: string]: AbstractControl } {
    return this.sendReviewForm.controls;
  }

  /**
   * Submits the request to create a review/comment to the parent component
   */
  public submitRequest(): any {
    let newStatus;
    this.isReviewer ? (newStatus = this.sendReviewForm.value.status) : 'comment';
    const comment = this.sendReviewForm.value.content;
    const newReviewOrComment = {
      content: comment,
      status: newStatus
    };
    this.commentEmiter.emit(newReviewOrComment);
    this.sendReviewForm.reset();
  }
}
