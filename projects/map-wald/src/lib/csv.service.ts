import { Injectable } from '@angular/core';

@Injectable()
export class CSVService {

  constructor() {

  }

//  parseKeyValueHeader(text:string) {
//    var lines:string[] = text.split('\n');
//    var result = {};
//
//    lines.forEach(function(line){
//      var components = line.split(',');
//      var key:string = components.shift();
//      var value = components.join(',');
//      result[<string>key] = value;
//    });
//
//    return result;
//  }
//
//  parseRegularCSV(text:string,idPrefix:string,asRecord:boolean){
//    idPrefix = (idPrefix===undefined)? 'PlaceIndex' : idPrefix;
//    var data = {};
//    var lines = text.split('\n');
//    var header = lines.shift();
//    var columns = header.split(',').map(Function.prototype.call,String.prototype.trim);
//    columns.shift();
//
//    var parseValue = function(val){
//      if(val==='-9999'){
//        return null;
//      }
//
//      var num = +val;
//      if(isNaN(num)){
//        return val.trim();
//      }
//      return num;
//    };
//
//    lines.forEach(function(line){
//      var cols = line.trim().split(',');
//      var polygonIdentifier = idPrefix + cols.shift();
//
//      if(asRecord) {
//        data[polygonIdentifier] = {};
//        cols.forEach(function(val,idx){
//          data[polygonIdentifier][columns[idx]] = parseValue(val);
//        });
//      } else {
//        data[polygonIdentifier] = cols.map(parseValue); //convert the numbers of type string into the actual numbers
//      }
//    });
//    data.columnNames = columns;
//    return data;
//  }
//
//  parseCSVWithHeader(text:string,idPrefix:string,asRecord:boolean){
//      var sections:Array<string>= text.split(/\n\-+\s*\n/);
//      var data = null;
//      if(sections.length>1){
//        data = this.parseKeyValueHeader(sections.shift());
//      } else {
//        data = {};
//      }
//
//      Object.assign(data,this.parseRegularCSV(sections[0],idPrefix,asRecord));
//      return data;
//  };
}
