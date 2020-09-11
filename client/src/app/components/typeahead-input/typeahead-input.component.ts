import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-typeahead-input',
  templateUrl: './typeahead-input.component.html',
  styleUrls: ['./typeahead-input.component.css']
})
export class TypeaheadInputComponent implements OnInit {
  @Input()
  public label: string;
  @Input()
  public searchFunc: any;
  @Input()
  public fc: any;
  @Input()
  public formatter: any;
  @Input()
  inputId: string;

  constructor() {}

  ngOnInit() {}
}
