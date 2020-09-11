import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PullRequestsComponent } from "./pull-requests.component";
import { CreateWorkItemComponent } from "./create/create-work-item.component";
import { ItemDetails } from "./itemDetails/item-details.component";
import { itemDetailsResolverService } from "./services/item-details-resolver.service";
import { RequestsTableComponent } from "./requests-table/requests-table.component";
import { AuthGuard } from "../guards/auth-guard";
import { SingleUserResolverService } from "../core/services/profile-resolver.service";
import { SearchBarComponent } from "./search-bar/search-bar.component";
import { SearchWorkitemsComponent } from "./search-workitems/search-workitems.component";
import { UsersResolverService } from "../core/services/users-resolver.service";
import { UserTeamsResolverService } from "../core/services/user-teams-resolver.service";
import { TagsResolverService } from "../core/services/tags-resolver.service";
import { EditItem } from './edit/edit-item.component';

const routes: Routes = [
  {
    path: "",
    component: PullRequestsComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: "create",
        component: CreateWorkItemComponent,
        resolve: {
          users: UsersResolverService,
          teams: UserTeamsResolverService,
          tags: TagsResolverService
        },
        pathMatch: "full"
      },
      {
        path: "all",
        component: RequestsTableComponent,
        resolve: { workItems: SingleUserResolverService },
        pathMatch: "full"
      },
      {
        path: "search",
        component: SearchWorkitemsComponent,
        pathMatch: "full"
      },

      {
        path: ":id",
        component: ItemDetails,
        resolve: { workItem: itemDetailsResolverService }
      },
      {
        path: "edit/:id",
        component: EditItem,
        resolve: { 
          workItem: itemDetailsResolverService,
          tags: TagsResolverService,
         }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PullRequestsRoutingModule {}
