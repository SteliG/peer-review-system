import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UserDetails } from 'src/app/models/user-details';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Review } from 'src/app/models/review';
import { SubmitComment } from 'src/app/models/submit-comment';
import { CommentsDataService } from 'src/app/core/services/comments-data.service';
import { Comment } from 'src/app/models/comment';

@Component({
  selector: 'item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetails implements OnInit {
  public workItem: any;
  public loggedUser: UserDetails;
  public isReviewer = false;
  public isAssignee = false;
  public reviewId: string;
  public comments: Comment[] = [];
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authenticationService: AuthenticationService,
    private readonly commentDataService: CommentsDataService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.workItem = data.workItem;
      this.comments = this.workItem.comments;
    });

    this.loggedUser = this.authenticationService.currentUserValue.user;
    this.updateReviewerAuthority();
    this.updateAssigneeAuthority();
    this.setCurrentReviewId();
  }

  /**
   * Updates the boolean that tracks whether the user is a reviewer
   */
  public updateReviewerAuthority(): void {
    const reviews: Review[] = this.workItem.reviews;
    const isUserAReviewer = reviews.some(review => review.username === this.loggedUser.username);
    this.isReviewer = isUserAReviewer;
  }

  /**
   * Checks whether the user is the author of the item
   */
  public updateAssigneeAuthority(): void {
    this.isAssignee = this.workItem.author.id === this.loggedUser.id;
  }

  /**
   * Sets the review id
   */
  public setCurrentReviewId(): void {
    const reviews: Review[] = this.workItem.reviews;
    const review: Review = reviews.find(review => review.username === this.loggedUser.username);
    if (review) {
      this.reviewId = review.reviewId;
    }
  }

  /**
   * Sends request to comment/submit review status for the item
   * @param event
   */
  public onCommentSubmition(event: SubmitComment): void {
    if (event.status === 'comment') {
      this.commentDataService
        .addComment(this.workItem.id, event.content)
        .subscribe((createdComment: Comment) => this.comments.push(createdComment));
    } else {
      const reviewId = this.reviewId;
      this.commentDataService
        .changeReviewStatus(reviewId, this.workItem.id, event)
        .subscribe(data => this.comments.push(data.comment));
    }
  }

  /**
   * Checks whether the user has the right to review/comment the item
   */
  public checkEditingRights(): boolean {
    const editableWorkItem = this.workItem.workItemStatus.status === 'pending';
    const editingAccessRights = this.isAssignee || this.loggedUser.role === 'admin';
    if (editableWorkItem && editingAccessRights) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Displays the files uploaded with the item
   */
  public filesToShow(): boolean {
    if (!this.workItem.files) {
      return false;
    }
    return this.workItem.files.length > 0;
  }
}
