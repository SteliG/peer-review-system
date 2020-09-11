import { Component, Output, EventEmitter } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'files-uploader',
  templateUrl: './files-uploader.component.html',
  styleUrls: ['./files-uploader.component.css']
})
export class FilesUploaderComponent {
  @Output() filesEmiter = new EventEmitter<NgxFileDropEntry[]>();

  constructor(private sanitizer: DomSanitizer) {}

  public dropped(files: NgxFileDropEntry[]) {
    this.filesEmiter.emit(files);
  }
}
