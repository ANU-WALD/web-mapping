
export interface TiledSublayerDescriptor {
  layer: string;
  keyField: string;
}

export interface VectorLayerDescriptor {
  name: string;
  description: string;
  tiles?: string;
  tileLayers?: TiledSublayerDescriptor[];
  availableZooms?: number[];
  source?: string;
  labelField?: string;
  label?: string;
  keyField?: string;
  displayZooms?: number[];
}
