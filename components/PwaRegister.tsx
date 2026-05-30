"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.update();

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "activated" &&
              navigator.serviceWorker.controller &&
              !reloading
            ) {
              reloading = true;
              window.location.reload();
            }
          });
        });
      })
      .catch(() => {
        /* ignore — PWA still works via manifest on some platforms */
      });

    const refreshServiceWorker = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.update();
      });
    };

    window.addEventListener("focus", refreshServiceWorker);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshServiceWorker();
    });

    return () => {
      window.removeEventListener("focus", refreshServiceWorker);
    };
  }, []);

  return null;
}
