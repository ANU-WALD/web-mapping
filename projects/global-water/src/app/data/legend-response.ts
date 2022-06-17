

export interface LegendResponse {
  max_value?: number;
  min_value?: number;
  values?: number[];
  palette: {
    R: number,
    G: number,
    B: number,
    A: number
  }[];
}

