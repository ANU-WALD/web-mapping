import { DateRange } from 'map-wald';

export interface MetadataConfig {
  filename?:string;
  meta:string[];
  variables?:string[];
  variable?:string;
}

export interface PaletteDescriptor {
  name:string;
  count:number;
  reverse?:boolean;
}

export interface RelativeOption {
  variable:string;
  palette?: PaletteDescriptor;
}

export interface LayerDescriptorCommon {
  label:string;
  legendLabels?:string[];
  breaks?:number[];
}

export interface LayerVariant extends LayerDescriptorCommon {
  variantLabel:string;
  relative?:RelativeOption;
  bin?:string;
}

export interface LayerDescriptor extends MetadataConfig, LayerDescriptorCommon {
  type:string;
  source:string;
  icon?:string;
  attribution?:string;
  attributionURL?:string;
  metadata?:string;
  url?: string;
  polygonDrill?: string;
  time:string;
  timeFirst:boolean;
  mapParams?:any;
  timePeriod?:DateRange;
  relatedFiles?:MetadataConfig[];
  // relativeOptions?:{[key:string]:RelativeOption};
  help?: string;
  palette?:PaletteDescriptor;
  variants?:LayerVariant[];
  chartLabel?:string;
  units?:string;
}

export interface FlattenedLayerDescriptor extends LayerDescriptor, LayerVariant { }

// export interface LayerDescriptor {
//   label: string;
//   name: string;
//   options?: {
//     temporal?: boolean;
//     threshold?: boolean;
//     delta?: boolean;
//     range?: number[];
//     deltaOffset?: number;
//   };
//   units: string;
//   help?: string;
// }


