import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: { [key: string]: Observable<any> } = {};

  constructor(private http: HttpClient) { }

  get(url:string):Observable<any>{
    if(!this.cache[url]){
      this.cache[url] = this.http.get(url).pipe(publishReplay(),refCount());
    }
    return this.cache[url];
  }

  post(url:string,data:any,options:any):Observable<any>{
    return this.http.post(url,data,options);
  }
}
