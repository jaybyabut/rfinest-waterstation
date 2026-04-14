"use client";

import { useEffect } from "react";

export function GlobalRestrictions() {
  useEffect(() => {
    const preventAction = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // KUNG ang user ay nasa loob ng input field o nagta-type, PAYAGAN ang action
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return; 
      }

      // KUNG HINDI, i-block ito 
      e.preventDefault();
    };

    // Harangin ang right-click at copy/paste outside inputs
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);
    document.addEventListener("cut", preventAction);
    document.addEventListener("paste", preventAction);

    return () => {
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("cut", preventAction);
      document.removeEventListener("paste", preventAction);
    };
  }, []);

  return null;
}
