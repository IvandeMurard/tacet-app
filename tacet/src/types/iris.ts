/**
 * IRIS zone types — aligned with paris-noise-iris.geojson properties.
 */

export interface IrisProperties {
  code_iris: string;
  name: string;
  c_ar: number;
  noise_level: number;
  primary_sources?: string | string[];
  day_level?: number;
  night_level?: number;
  description?: string;
}

export interface IrisFeature {
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: IrisProperties;
}

export interface IrisZone extends IrisProperties {
  /** GeoJSON feature id if available */
  id?: string | number;
}
