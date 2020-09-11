import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { RouterModule } from '@angular/router';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ProfileComponent],
  imports: [CommonModule, RouterModule, SharedModule, ProfileRoutingModule]
})
export class ProfileModule {}
