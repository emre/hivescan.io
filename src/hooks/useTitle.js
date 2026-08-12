import { useEffect } from "react";

/** Keeps the tab title, browser history, and shared links coherent —
 *  restores the previous title on unmount so route transitions can't
 *  leave a stale one behind between a view unmounting and the next
 *  one setting its own. */
export function useTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · hivescan` : "hivescan.io";
    return () => { document.title = previous; };
  }, [title]);
}
