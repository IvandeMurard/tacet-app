import { MapProvider } from "@/contexts/MapContext";
import { MapPageClient } from "./MapPageClient";

export default function Home() {
  return (
    <MapProvider>
      <MapPageClient />
    </MapProvider>
  );
}
