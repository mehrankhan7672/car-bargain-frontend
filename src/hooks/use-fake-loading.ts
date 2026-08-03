import { useEffect, useState } from "react";

/** Simulates a short data fetch so loading skeletons are visible (demo data only). */
export function useFakeLoading(ms = 600) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
