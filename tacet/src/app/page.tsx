import dynamic from "next/dynamic";
import { Legend } from "@/components/Legend";

const Map = dynamic(() => import("@/components/Map").then((m) => m.Map), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Map />
      <Legend />
    </main>
  );
}
