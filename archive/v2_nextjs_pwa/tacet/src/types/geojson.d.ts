/**
 * Type declaration for .geojson file imports.
 * Enables: import data from "path/to/file.geojson"
 * Works in conjunction with resolveJsonModule: true (tsconfig) and the
 * webpack/bundler JSON loader in Next.js.
 */
declare module "*.geojson" {
  const value: {
    type: string;
    features: Array<{
      type: string;
      geometry: unknown;
      properties: Record<string, unknown>;
    }>;
  };
  export = value;
}
