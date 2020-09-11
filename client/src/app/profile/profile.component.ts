import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { first, debounceTime, map } from 'rxjs/operators';
import { NgbTabset, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Team } from '../models/team';
import { Invitation } from '../models/invitation';
import { UserDetails } from '../models/user-details';
import { User } from '../models/user';
import { AuthenticationService } from '../core/services/authentication.service';
import { TeamService } from '../core/services/team.service';
import { SimpleTeamInfo } from '../models/simple-team-info';
import { WorkItemDataService } from '../core/services/work-item-data.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [NgbTabset]
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  public createTeamForm: FormGroup;
  public currentUser: User;
  public isSubmitted = false;
  public subscription: Subscription;
  public sendInvite = false;
  public userTeams: Team[];
  public model: any;
  public addedUsers: UserDetails[] = [];
  public activeInvitations: any[] = [];
  public errorMessage = '';
  public search: any = this.searchFunc.bind(this);
  @ViewChild('t') public tabset: NgbTabset;
  public isChecked = true;
  public selectedTabId: string;
  public successfulInvitation = false;
  public addTeamMembersForm: FormGroup;
  public leaveClicked = false;
  public myCheckbox: FormControl = new FormControl();
  public userTeamsToggles: boolean[];
  public addTeamMembersFormArray: FormGroup[] = [];
  public invalidInput = false;
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly teamService: TeamService,
    private readonly formBuilder: FormBuilder,
    private readonly workItemDataService: WorkItemDataService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly modalService: NgbModal
  ) {
    this.subscription = this.authenticationService.currentUser.subscribe(x => (this.currentUser = x));
  }

  ngOnInit() {
    this.createTeamForm = this.formBuilder.group({
      teamName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      rule: this.formBuilder.group({
        minPercentApprovalOfItem: ['', [Validators.required, Validators.min(50), Validators.max(100)]],
        minNumberOfReviewers: ['', [Validators.required, Validators.min(2)]]
      })
    });

    this.getTeams();
    this.getInvitations();
    this.getAllUsers();
    this.selectedTabId = this.route.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {
    this.tabset.select(this.selectedTabId);
  }

  /**
   * Gets the names of all the users using the aplication
   */
  public getAllUsers() {
    this.workItemDataService.getUsers().subscribe((data: UserDetails[]) => {
      const users = data;
      for (const user of users) {
        this.addedUsers.push(user);
      }
    });
  }
  /**
   * Gets the pending team invitations
   */
  public getInvitations() {
    this.teamService.showPendingInvitations(this.currentUser.user.id).subscribe(
      (data: Invitation[]) => {
        const teamInvitations = data;
        for (const invitation of teamInvitations) {
          const teamName = invitation.team.teamName;
          const id = invitation.id;
          this.activeInvitations.push({ name: teamName, invitationId: id });
        }
      },
      error => {
        this.invalidInput = true;
      }
    );
  }
  /**
   * Gets the teams that the user is a part of
   */
  public getTeams(): void {
    this.teamService.getTeamsByUserId(this.currentUser.user.id).subscribe((teams: SimpleTeamInfo[]) => {
      this.userTeams = teams;
      this.userTeamsToggles = [];
      this.addTeamMembersFormArray = [];
      teams.forEach(team => {
        this.userTeamsToggles.push(false);
        this.addTeamMembersFormArray.push(this.formBuilder.group({ member: ['', Validators.required] }));
      });
    });
  }

  /**
   * Gets the form controls of the form
   */
  get formControls(): { [key: string]: AbstractControl } {
    return this.createTeamForm.controls;
  }

  /**
   * Sets a boolean whether to show the inviatation menu for a team
   */
  public toggleInvitation(i): void {
    this.userTeamsToggles[i] = !this.userTeamsToggles[i];
  }

  /**
   * Creates a new team
   */
  public createTeam() {
    this.isSubmitted = !this.isSubmitted;

    if (this.createTeamForm.invalid) {
      return;
    }
    this.teamService
      .createNewTeam(this.createTeamForm.value)
      .pipe(first())
      .subscribe(
        (data: Team) => {
          this.teamService.getTeamsByUserId(this.currentUser.user.id).subscribe((teams: SimpleTeamInfo[]) => {
            this.userTeams = teams;
            this.userTeamsToggles = [];
            this.addTeamMembersFormArray = [];
            teams.forEach(team => {
              this.userTeamsToggles.push(false);
              this.addTeamMembersFormArray.push(this.formBuilder.group({ member: ['', Validators.required] }));
            });
          });
          this.isSubmitted = !this.isSubmitted;
          this.router.navigate(['/profile/teams']);
          this.tabset.select('teams');
          this.createTeamForm.reset();
        },
        error => {
          this.invalidInput = true;
          console.error();
        }
      );

    this.getTeams();
  }

  /**
   * Sets the team rules to the company team rules
   */
  public setRulesToDefault() {
    this.isChecked = !this.isChecked;
    this.createTeamForm.controls.rule.setValue({
      minNumberOfReviewers: 3,
      minPercentApprovalOfItem: 100
    });
  }

  /**
   * Cleans the input if the user unckecks the checkbox
   */
  public cleanDefaultRules() {
    this.isChecked = !this.isChecked;
    this.createTeamForm.controls.rule.reset();
  }

  /**
   * Searches through the names of the users for the dropdown menu
   */
  public searchFunc(text$: Observable<string>) {
    return text$.pipe(
      debounceTime(200),
      map(term =>
        term === ''
          ? []
          : this.addedUsers
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
  public formatter(x: { username: string }): string {
    return x.username;
  }

  /**
   * Sends team invitation to the selected user
   * @param team
   * @param form
   */
  public sendMemberInvitation(team, form) {
    const addInvitationBody = {
      teamName: team.teamName,
      inviteeName: form.value.member.username
    };

    this.teamService.createTeamMemberInvitation(addInvitationBody, this.currentUser).subscribe(
      (data: Invitation) => {
        this.successfulInvitation = true;
      },
      error => {
        if (error === 'Internal Server Error!') {
          this.invalidInput = true;
        } else {
          this.errorMessage = error;
        }
      }
    );
    this.sendInvite = true;
    const chosenIndex = this.userTeams.findIndex(x => x.teamName === team.teamName);
    this.addTeamMembersFormArray[chosenIndex].reset();
    setTimeout(() => {
      this.sendInvite = false;
      this.toggleInvitation(chosenIndex);
    }, 3000);
  }

  /**
   * Accept the invitation to join a team
   * @param invitation
   */
  public acceptInvitation(invitation) {
    this.teamService.acceptInvitation(invitation.invitationId).subscribe((data: Invitation) => {
      this.activeInvitations = [];
      this.getInvitations();
    });
  }

  /**
   * Rejects the offered invitation to join a team
   * @param invitation
   */
  public rejectInvitation(invitation) {
    this.teamService.rejectInvitation(invitation.invitationId).subscribe((data: Invitation) => {
      this.activeInvitations = [];
      this.getInvitations();
    });
    this.getTeams();

    this.tabset.select('teams');
  }

  /**
   *The user leaves a team that they have been a part of
   * @param team
   */
  public leaveTeam(team: Team) {
    this.teamService
      .leaveTeam(team.id, this.currentUser)
      .subscribe(data => (this.userTeams = this.userTeams.filter(x => x.id !== team.id)));
  }

  /**
   *Opens the leave team modal
   * @param content
   * @param team
   */
  public open(content, team) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      result => {
        this.leaveTeam(team);
      },
      reason => {}
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
