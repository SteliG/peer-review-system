import { PullRequestsRoutingModule } from './pull-requests-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { PullRequestsComponent } from './pull-requests.component';
import { CreateWorkItemComponent } from './create/create-work-item.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReviewerItemComponent } from './reviewerItem/reviewer-item-component';
import { ItemDetails } from './itemDetails/item-details.component';
import { ItemComment } from './itemComment/item-comment.component';
import { DisplayCommentComponent } from './comments/display-comment.component';
import { RequestsNavComponent } from './requests-nav/requests-nav.component';
import { RequestsTableComponent } from './requests-table/requests-table.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchWorkitemsComponent } from './search-workitems/search-workitems.component';
import { WorkitemsTableComponent } from './workitems-table/workitems-table.component';
import { EditItem } from './edit/edit-item.component';
import { FilesUploaderComponent } from './filesUploader/files-uploader.component';
import { NgxFileDropModule } from 'ngx-file-drop';

@NgModule({
  declarations: [
    PullRequestsComponent,
    CreateWorkItemComponent,
    ReviewerItemComponent,
    ItemDetails,
    ItemComment,
    DisplayCommentComponent,
    RequestsNavComponent,
    RequestsTableComponent,
    SearchBarComponent,
    SearchWorkitemsComponent,
    WorkitemsTableComponent,
    EditItem,
    FilesUploaderComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    PullRequestsRoutingModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NgxFileDropModule
  ]
})
export class PullRequestsModule {}
