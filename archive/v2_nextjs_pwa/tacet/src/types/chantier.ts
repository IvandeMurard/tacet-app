/**
 * Properties attached to each chantier GeoJSON feature.
 * Mirrors the shape set by `ChantiersLayer.ts → toGeoJSON()`.
 * Empty string ("") is used for missing optional fields from the Open Data Paris payload.
 */
export interface ChantierProperties {
  adresse: string;
  date_fin: string;
  type_chantier: string;
}
