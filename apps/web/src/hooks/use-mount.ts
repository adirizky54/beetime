import { useEffect } from "react";

export const useMount = (fn: () => void) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    fn?.();
  }, []);
};