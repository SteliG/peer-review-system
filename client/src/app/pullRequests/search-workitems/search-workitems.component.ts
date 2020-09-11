import { Component, OnInit } from '@angular/core';
import { WorkItem } from 'src/app/models/work-item';

@Component({
  selector: 'app-search-workitems',
  templateUrl: './search-workitems.component.html',
  styleUrls: ['./search-workitems.component.css']
})
export class SearchWorkitemsComponent implements OnInit {
  public workItems: WorkItem[] = [];
  constructor() {}

  ngOnInit() {}

  updateTable(data: any) {
    this.workItems = data;
  }
}
