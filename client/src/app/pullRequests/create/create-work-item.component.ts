import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { WorkItemDataService } from 'src/app/core/services/work-item-data.service';
import { UserDetails } from 'src/app/models/user-details';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Tag } from 'src/app/models/tag';
import { TeamService } from 'src/app/core/services/team.service';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { CreateWorkItem } from 'src/app/models/create-work-item';
import { Router, ActivatedRoute } from '@angular/router';
import { Team } from 'src/app/models/team';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { WorkItem } from 'src/app/models/work-item';

@Component({
  selector: 'create-work-item',
  templateUrl: './create-work-item.component.html',
  styleUrls: ['./create-work-item.component.css'],
  providers: [NgbTypeaheadConfig]
})
export class CreateWorkItemComponent implements OnInit {
  public createWorkItemForm: FormGroup;
  public isSubmitted = false;
  public chosenTeam: Team = new Team('Choose a team');
  public model: any;
  public addedUsernames: UserDetails[] = [];
  public title: string;
  public files: NgxFileDropEntry[] = [];
  public teamNames: string[];
  public loggedUser: UserDetails = new UserDetails();
  public users: UserDetails[] = [];
  public userNames: string[] = [];
  public tags: Tag[] = [];
  public userTeams: Team[] = [];
  public selectedItems: Tag[] = [];
  public dropdownSettings = {};
  public search: any = this.searchFunc.bind(this);
  private readonly MAX_FILE_SIZE: number = 20000000;
  public options: Object = {
    placeholderText: 'Write description',
    charCounterCount: false,
    events: {
      'froalaEditor.focus'(e, editor) {}
    }
  };
  constructor(
    private readonly workItemDataService: WorkItemDataService,
    private readonly authenticationService: AuthenticationService,
    private readonly teamService: TeamService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loggedUser = this.authenticationService.currentUserValue.user;
    this.activatedRoute.data.subscribe(data => {
      this.users = data.users;
      for (const user of this.users) {
        this.userNames.push(user.username);
      }
      this.userTeams = data.teams;
      this.teamNames = this.userTeams.map((team: Team) => team.teamName);
      this.tags = data.tags;
    });
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.createWorkItemForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      reviewer: ['', []],
      tagControl: ['', []],
      editorModel: ['', [Validators.required, Validators.minLength(17)]]
    });
  }

  /**
   * Changes the name of the chosen team
   * @param chosenTeam
   */
  public changeTeam(chosenTeam: Team): void {
    this.chosenTeam = chosenTeam;
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
  public formatter(x: { username: string }): string {
    return x.username;
  }

  /**
   *Adds the user to the list of reviewers
   */
  public addUsername(): void {
    const user = this.createWorkItemForm.value.reviewer;
    const index = this.findIndex(this.users, user);
    this.addedUsernames.push(user);
    this.users.splice(index, 1);
    this.createWorkItemForm.controls.reviewer.reset();
  }
  /**
   * Checks whether the enough reviewers are added to the list of reviewers
   */
  public notEnoughReviewersAdded(): boolean {
    return this.addedUsernames.length < this.chosenTeam.rules.minNumberOfReviewers;
  }

  /**
   *Removes a reviewer from the list of reviewers
   * @param event -
   */
  public removeReviewer(event: UserDetails): void {
    const index = this.findIndex(this.addedUsernames, event);
    this.addedUsernames.splice(index, 1);
    this.users.push(event);
  }

  /**Finds the index of the user in the array of users
   *
   * @param arr
   * @param user
   */
  public findIndex(arr, user: UserDetails): number {
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      if (element.id === user.id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Checks whether all requirements are fullfilled and creates a new workitem
   */
  public createWorkItem(): WorkItem {
    this.isSubmitted = true;
    if (this.createWorkItemForm.invalid) {
      return;
    }

    if (!this.chosenTeam.rules || this.notEnoughReviewersAdded()) {
      return;
    }

    const reviewers: { username: string }[] = this.addedUsernames.map(reviewer => ({ username: reviewer.username }));
    const tags: { name: string }[] = this.selectedItems.map((tag: Tag) => ({
      name: tag.name
    }));

    const createdWorkItem: CreateWorkItem = {
      description: this.createWorkItemForm.value.editorModel,
      reviewers,
      team: this.chosenTeam.teamName,
      title: this.title,
      tags
    };

    this.workItemDataService.createWorkItem(createdWorkItem).subscribe(data => {
      const formData = new FormData();

      for (const file of this.files) {
        if (file.fileEntry.isFile) {
          const fileEntry = file.fileEntry as FileSystemFileEntry;
          fileEntry.file((currentFile: File) => {
            formData.append('files', currentFile);
          });
        }
      }
      this.workItemDataService.attachedFilesToWorkItem(data.id, formData).subscribe(workItem => {
        this.router.navigate([`/pullRequests/${data.id}`]);
      });
    });
  }

  /**
   * Listens for an event of file upload
   * @param event
   */
  public onFilesUpload(event: NgxFileDropEntry[]): void {
    for (const file of event) {
      const fileEntry = file.fileEntry as FileSystemFileEntry;
      let isValidSize = false;

      fileEntry.file((currentFile: File) => {
        if (Number(currentFile.size) < this.MAX_FILE_SIZE) {
          isValidSize = true;
        }
        if (!isValidSize) {
          window.alert(`${file.fileEntry.name} is larger than 20MB.`);
        } else {
          const foundIndex = this.files.findIndex(currentFile => currentFile.relativePath === file.relativePath);
          if (foundIndex >= 0) {
            const fileRemovalConfirmation = `Are you sure to replace ${file.relativePath}`;
            if (confirm(fileRemovalConfirmation)) {
              this.files.splice(foundIndex, 1);
              this.files.push(file);
            }
          } else {
            this.files.push(file);
          }
        }
      });
    }
  }

  /**
   *
   * @param item Removes the file from the list of uploaded files
   */
  public removeFile(item: NgxFileDropEntry): void {
    this.files = this.files.filter(file => file.relativePath !== item.relativePath);
  }
  /**
   * Checks whether there are uploaded files
   * @type {boolean}
   */
  public filesToShow(): boolean {
    return this.files.length > 0;
  }
}
