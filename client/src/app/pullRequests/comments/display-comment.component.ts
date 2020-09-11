import { Component, Input } from '@angular/core';

@Component({
  selector: 'display-comment',
  templateUrl: './display-comment.component.html',
  styleUrls: ['./display-comment.component.css']
})
export class DisplayCommentComponent {
  @Input()
  comments: Comment[];
  constructor() {}
}
