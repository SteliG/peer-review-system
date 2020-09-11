import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification-view',
  templateUrl: './notification-view.component.html',
  styleUrls: ['./notification-view.component.css']
})
export class NotificationViewComponent implements OnInit {
  public not1 = {
    title: 'Review Request',
    text: 'Valka2 assigned you as reviewer to "Why do you need to unsubscribe"'
  };

  public not2 = {
    title: 'Team Invitation',
    text: 'You have been invited to the team "The Invincibles"!'
  };

  public not3 = {
    title: 'New Comment',
    text: 'Gosho commented on your item!'
  };
  public notificationsArray = [this.not1, this.not2, this.not3];
  constructor() {}

  ngOnInit() {}
}
