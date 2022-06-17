import { UTCDate } from 'map-wald';
import { LayerDescriptor } from './layer-descriptor';

export interface MapSettings {
  date: UTCDate;
  // binary: boolean;
  // difference: boolean;
  // referenceYear: number;
  // threshold: number;
  layer: LayerDescriptor;
  opacity: number;
  relative: boolean;
  relativeVariable: string;
  dateStep: number;
}

