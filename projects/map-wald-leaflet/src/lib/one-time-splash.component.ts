import { Component, Input, ViewChild, AfterViewInit, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as store from 'store';

export enum SplashCloseMode {
  NotOpened,
  Accepted,
  Cancelled
}

@Component({
  selector: 'one-time-splash',
  template: `<ng-template #splashTemplate let-c="close" let-d="dismiss">
  <div *ngIf="label" class="modal-header">
    <h4 class="modal-title">
      {{label}}</h4>
    <button type="button" class="close" aria-label="Close" (click)="d('Cross click')">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="modal-body">
    <ng-content></ng-content>
  </div>
  <div class="modal-footer">
    <label *ngIf="application">
      <input type="checkbox" [(ngModel)]="doNotShow" (ngModelChange)="doNotShowClicked()">
      &nbsp; {{hideMessage}}
    </label>
    <button autofocus type="button" class="btn btn-secondary" (click)="c('Close click')">Close</button>
  </div>
  </ng-template>
`,
  styles: [``]
})
export class OneTimeSplashComponent implements AfterViewInit  {
  @ViewChild('splashTemplate',{static:false}) splashTemplate:any;
  @Input() application:string;
  @Input() label = 'About';
  @Input() hideMessage = 'Understood, I don’t need to see this again';
  @Input() klass: string;
  @Input() showOnLaunch = true;
  @Output() closed = new EventEmitter<SplashCloseMode>();
  doNotShow: boolean;
  current:NgbModalRef;

  constructor(private modalService: NgbModal){

  }

  storageKey(): string {
    if(!this.application){
      return null;
    }

    return this.application  + '-splash-skip';
  }

  ngAfterViewInit(): void {
    setTimeout(()=>{
      const key = this.storageKey();
      if(key){
        this.doNotShow = store.get(key,false);
      }

      if(this.showOnLaunch){
        this.defaultShow();
      }
    });
  }

  defaultShow(): void {
    if(!this.doNotShow){
      this.show();
    } else {
      this.closed.emit(SplashCloseMode.NotOpened);
    }
  }

  show(): void {
    this.current = this.modalService.open(this.splashTemplate,{
      size:'lg',
      windowClass:this.klass
    });
  }

  close(): void {
    if(!this.current){
      this.closed.emit(SplashCloseMode.NotOpened);
      return;
    }

    this.current.close();
    this.current=null;
    this.closed.emit(SplashCloseMode.Accepted);
  }

  doNotShowClicked(): void {
    const key = this.storageKey();
    if(!key){
      return;
    }

    store.set(key,this.doNotShow);
  }
}
