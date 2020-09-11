import { UserDetails } from './user-details';
import { Team } from './team';
import { InvitationStatus } from './invitation-status';

export class Invitation {
  host: UserDetails;
  id: string;
  invitee: UserDetails;
  status: InvitationStatus;
  team: Team;
}
