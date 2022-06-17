// import { Component, OnInit, EventEmitter, Output } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { of } from 'rxjs';
// import { environment } from '../environments/environment';

// const EMAIL_REGEXP=/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// @Component({
//   selector: 'app-download-form',
//   templateUrl: './download-form.component.html',
//   styleUrls: ['./download-form.component.scss']
// })
// export class DownloadFormComponent implements OnInit {
//   @Output() submitted = new EventEmitter<void>();
//   emailAddress: string;
//   subscribe = true;
//   valid = false;

//   constructor(private http: HttpClient) { }

//   ngOnInit(): void {
//   }

//   submit(): void {
//     this.validate();
//     if(!this.valid){
//       return;
//     }

//     const post$ = this.http.post(environment.registration,{
//         email: this.emailAddress,
//         updates:this.subscribe
//     },{
//       responseType:'text'
//     });
//     // const post$ = of(null);
//     post$.subscribe(res=>{
//       this.submitted.emit();
//     });
//   }

//   validate(): void {
//     this.valid = !!this.emailAddress.match(EMAIL_REGEXP);
//   }
// }
