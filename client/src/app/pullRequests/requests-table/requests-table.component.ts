import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WorkItemDataService } from 'src/app/core/services/work-item-data.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UserDetails } from 'src/app/models/user-details';
import { WorkItem } from 'src/app/models/work-item';

@Component({
  selector: 'app-requests-table',
  templateUrl: './requests-table.component.html',
  styleUrls: ['./requests-table.component.css']
})
export class RequestsTableComponent implements OnInit {
  public loggedUser: UserDetails = new UserDetails();
  public workItems: WorkItem[] = [];

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.currentUserValue.user;

    this.activatedRoute.data.subscribe(data => {
      this.workItems = data.workItems;
    });
  }
}
