import { useEffect, useState } from "react";
import { nativeBridge } from "./nativeBridge";

export type NextAlarm = { triggerAt: string; time: string };

/** Fresh read-only snapshot of the device alarm; browsers and devices without one return null. */
export function useNextAlarm() {
  const [alarm, setAlarm] = useState<NextAlarm | null>(null);
  useEffect(() => {
    let active = true;
    void nativeBridge.getNextAlarm().then((next) => { if (active) setAlarm(next); });
    return () => { active = false; };
  }, []);
  return alarm;
}
