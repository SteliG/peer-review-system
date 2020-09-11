import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';

import { Tag } from 'src/app/models/tag';
import { WorkItemDataService } from 'src/app/core/services/work-item-data.service';
import { UpdateWorkItem } from 'src/app/models/update-work-item';
import { FileEntity } from 'src/app/models/file-entity';
import { WorkItem } from 'src/app/models/work-item';

@Component({
  selector: 'edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css'],
  providers: [NgbTypeaheadConfig]
})
export class EditItem implements OnInit {
  private readonly MAX_FILE_SIZE: number = 20000000;
  public oldFiles: FileEntity[] = [];
  public oldFilesToBeRemove: FileEntity[] = [];
  public files: NgxFileDropEntry[] = [];
  public workItem: WorkItem;
  public updateWorkItemForm: FormGroup;
  public tags: Tag[] = [];
  public selectedItems: Tag[] = [];
  public dropdownSettings = {};
  public isSubmitted = false;
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly workItemDataService: WorkItemDataService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.workItem = data.workItem;
      this.tags = data.tags;
      this.selectedItems = this.workItem.tags;
      this.oldFiles = this.workItem.files;
    });
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.updateWorkItemForm = this.formBuilder.group({
      title: [this.workItem.title, [Validators.required, Validators.minLength(3)]],
      reviwer: ['', []],
      tagControl: [this.workItem.tags, []],
      editorModel: [this.workItem.description, [Validators.required, Validators.minLength(17)]]
    });
  }
  public onItemSelect(item: any) {}
  public onSelectAll(items: any) {}

  /**
   * Updates the edited workitem
   */
  public updateWorkItem() {
    this.isSubmitted = true;
    if (this.updateWorkItemForm.invalid) {
      return;
    }
    const tags: { name: string }[] = this.selectedItems.map((tag: Tag) => ({
      name: tag.name
    }));

    const updatedWorkItem: UpdateWorkItem = {
      description: this.updateWorkItemForm.value.editorModel,
      title: this.updateWorkItemForm.value.title,
      tags,
      filesToBeRemoved: this.oldFilesToBeRemove
    };

    this.workItemDataService.updateWorkItemById(this.workItem.id, updatedWorkItem).subscribe(data => {
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
   * Listens for the event of uploading of new files
   * @param event
   */
  public onFilesUpload(event: NgxFileDropEntry[]) {
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
          const foundOldFileIndex = this.oldFiles.findIndex(oldFile => oldFile.fileName === file.relativePath);
          if (foundIndex >= 0) {
            if (confirm(`Are you sure to replace ${file.relativePath}?`)) {
              this.files.splice(foundIndex, 1);
              this.files.push(file);
            }
          } else if (foundOldFileIndex >= 0) {
            if (confirm(`Are you sure to replace ${file.relativePath}?`)) {
              const oldFileToBeRemove: FileEntity = this.oldFiles.splice(foundOldFileIndex, 1)[0];
              this.oldFilesToBeRemove.push(oldFileToBeRemove);
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
   * Shows the files uploaded with the workitem
   */
  public filesToShow(): boolean {
    if (this.oldFiles.length > 0 || this.files.length > 0) {
      return true;
    }
    return false;
  }
  /**
   * Removes the deleted files
   * @param item
   */
  public removeFile(item: NgxFileDropEntry): void {
    this.files = this.files.filter(file => file.relativePath !== item.relativePath);
  }
  removeOldFile(oldFile: FileEntity): void {
    this.oldFiles = this.oldFiles.filter(f => f.fileName !== oldFile.fileName);
    this.oldFilesToBeRemove.push(oldFile);
  }
}
