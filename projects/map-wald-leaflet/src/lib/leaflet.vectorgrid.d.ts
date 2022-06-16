declare namespace L {

  namespace vectorGrid {

    export function slicer(data: any, options?: any): any;

    export function protobuf(url:string, options?: any):VectorGridLayer;
  }

  export class VectorGridLayer extends GridLayer {
    resetFeatureStyle(f: any): void;
    setFeatureStyle(f: any, style: any): void;

    // on(type:string,handler: LeafletMouseEventHandlerFn, context?: any): this;
    // on(type:'click',handler: LeafletMouseEventHandlerFn, context?: any): this;
  }
}
