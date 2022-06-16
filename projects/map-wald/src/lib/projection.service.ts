import { Injectable } from '@angular/core';
//import * as proj4 from 'proj4';
import * as proj4 from 'proj4';
//const proj4 = require('proj4').default;

@Injectable()
export class ProjectionService {

  constructor() {

  }

  proj4(){
    return proj4;
  }
}
