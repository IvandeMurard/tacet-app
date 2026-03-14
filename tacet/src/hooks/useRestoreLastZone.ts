import { useEffect, useRef } from "react";
import { useMapContext } from "@/contexts/MapContext";

/**
 * On first mount, if the user has a previously visited zone in localStorage
 * and no zone is currently selected, auto-opens that zone's IrisPopup.
 * Runs exactly once per session (guarded by a ref).
 *
 * Implements story-4.6 (E4-M1): last visited zone auto-restored on load.
 */
export function useRestoreLastZone(): void {
  const { lastVisitedZone, selectedZone, setSelectedZone } = useMapContext();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    if (lastVisitedZone && !selectedZone) {
      restoredRef.current = true;
      setSelectedZone(lastVisitedZone);
    }
  }, [lastVisitedZone, selectedZone, setSelectedZone]);
}
