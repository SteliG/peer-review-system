import { Injectable } from '@angular/core';
import { Team } from 'src/app/models/team';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TeamService } from './team.service';
import { AuthenticationService } from './authentication.service';
import { UserDetails } from 'src/app/models/user-details';

@Injectable({
    providedIn: "root"
  })
  export class UserTeamsResolverService
    implements Resolve<Team[] | { teams: Team[] }> {
    private readonly loggedUser: UserDetails;
    constructor(
      private readonly teamService: TeamService,
      private readonly authenticationService: AuthenticationService,
      
    ) {
        this.loggedUser = this.authenticationService.currentUserValue.user;
        console.log(this.loggedUser);
    }
    public resolve(): Observable<any> | Promise<any> | any {
        
      return this.teamService
        .getTeamsByUserId(this.loggedUser.id)
        .pipe(
          catchError(res => {
            //console.log("Fail to find workItems"),
            return of({ teams: null });
          })
        );
    }
  }