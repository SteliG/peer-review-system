import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/models/user';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { UserDetails } from 'src/app/models/user-details';
import { WorkItemDataService } from 'src/app/core/services/work-item-data.service';
import { Tag } from 'src/app/models/tag';
import { TeamService } from 'src/app/core/services/team.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Team } from 'src/app/models/team';
import { FormGroup, FormBuilder } from '@angular/forms';
import { createUrlResolverWithoutPackagePrefix } from '@angular/compiler';
import { WorkItem } from 'src/app/models/work-item';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  @Output() updateSearchResults = new EventEmitter<WorkItem[]>();
  public users: UserDetails[];
  public userNames: string[] = [];
  public tags: Tag[];
  public currentUser: UserDetails;
  public teams: Team[];
  public teamNames: string[] = [];
  public searchForm: FormGroup;
  public chosenTag = '';
  public chosenStatus = '';
  public empty = false;
  public search: any = this.searchFunc.bind(this);
  public teamSearch: any = this.teamSearchFunc.bind(this);
  constructor(
    private readonly workItemDataService: WorkItemDataService,
    private readonly teamService: TeamService,
    private readonly authenticationService: AuthenticationService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      title: [''],
      author: [''],
      asignee: [''],
      team: ['']
    });
    this.currentUser = this.authenticationService.currentUserValue.user;
    this.workItemDataService.getUsers().subscribe((users: UserDetails[]) => {
      this.users = users;
      for (const user of users) {
        const name = user.username;
        this.userNames.push(name);
      }
      this.userNames.push(this.currentUser.username);
    });

    this.workItemDataService.getTags().subscribe((tags: Tag[]) => {
      this.tags = tags;
    });

    this.teamService.getTeamsByUserId(this.currentUser.id).subscribe((teams: Team[]) => {
      this.teams = teams;
      for (const team of teams) {
        const teamName = team.teamName;
        this.teamNames.push(teamName);
      }
    });
  }
  /**
   * Searches through the names of all the users and excludes the name of the current user
   */

  public searchFunc(text$: Observable<string>) {
    return text$.pipe(
      debounceTime(200),
      map(term =>
        term === ''
          ? []
          : this.users
              .filter((user: any) => {
                return user.username.toLowerCase().indexOf(term.toLowerCase()) > -1;
              })
              .slice(0, 10)
      )
    );
  }

  /**
   * Formats the result of the search function
   */
  public formatter(x: { username: string }) {
    return x.username;
  }

  /**
   * Searches through the names of all the teams
   */
  public teamSearchFunc(text$: Observable<string>) {
    return text$.pipe(
      debounceTime(200),
      map(term =>
        term === ''
          ? []
          : this.teams.filter(team => team.teamName.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)
      )
    );
  }

  /**
   * Formats the results of the teamSearchFunc
   */
  public formatterTeam(x: { teamName: string }) {
    return x.teamName;
  }

  /**
   * Changes the chosen tag for the item
   * @param tag
   */
  public changeTag(tag: string) {
    this.chosenTag = tag;
  }

  /**
   *
   * @param status Changes the status of the item
   */
  public changeStatus(status: string) {
    this.chosenStatus = status;
  }

  /**
   * Searches through all the workitems acording to the selected criteria
   */
  searchForWorkitems() {
    const title = this.searchForm.value.title;
    const author = this.searchForm.value.author.username;
    const asignee = this.searchForm.value.asignee.username;
    const team = this.searchForm.value.team.teamName;
    const tag = this.chosenTag;
    const status = this.chosenStatus;
    let urlStr = '?';
    if (title) {
      urlStr += `title=${title}&`;
    }
    if (author) {
      urlStr += `author=${author}&`;
    }
    if (asignee) {
      urlStr += `asignee=${asignee}&`;
    }
    if (team) {
      urlStr += `team=${team}&`;
    }
    if (tag) {
      urlStr += `tag=${tag}&`;
    }
    if (status) {
      urlStr += `status=${status}&`;
    }
    this.empty = false;
    this.workItemDataService.getSelectedWorkItems(urlStr).subscribe((data: WorkItem[]) => {
      if (!(data && data.length)) {
        this.empty = true;
      }
      this.updateSearchResults.emit(data);
    });
  }
}
