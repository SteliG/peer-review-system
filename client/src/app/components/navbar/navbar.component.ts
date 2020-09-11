import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User;
  isShownNotification = false;

  constructor(private router: Router, private authenticationService: AuthenticationService) {
    this.authenticationService.currentUser.subscribe(x => (this.currentUser = x));
  }

  ngOnInit() {}

  public notificationToggle() {
    this.isShownNotification = !this.isShownNotification;
  }
  public logout() {
    this.authenticationService.logout();
  }
}
