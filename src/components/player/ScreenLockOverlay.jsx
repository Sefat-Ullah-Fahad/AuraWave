import React, { useEffect, useRef, useState } from "react";
import { FiUnlock } from "react-icons/fi";

export function ScreenLockOverlay({ onUnlock }) {
  const holdTimerRef = useRef(null);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let disposed = false;
    let wakeLock = null;

    const acquireWakeLock = async () => {
      if (
        disposed ||
        document.visibilityState !== "visible" ||
        !navigator.wakeLock
      )
        return;

      try {
        const lock = await navigator.wakeLock.request("screen");
        if (disposed) {
          await lock.release();
          return;
        }

        wakeLock = lock;
        wakeLock.addEventListener(
          "release",
          () => {
            wakeLock = null;
          },
          { once: true },
        );
      } catch {
        wakeLock = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !wakeLock) {
        acquireWakeLock();
      }
    };

    if ("wakeLock" in navigator) {
      acquireWakeLock();
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      disposed = true;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (wakeLock && !wakeLock.released) wakeLock.release();
    };
  }, []);

  const startUnlockHold = (event) => {
    event.preventDefault();
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setIsHolding(true);
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      setIsHolding(false);
      onUnlock();
    }, 1500);
  };

  const cancelUnlockHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    setIsHolding(false);
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black touch-none"
      style={{ height: "100dvh", overscrollBehavior: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label="Screen locked"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="flex min-h-14 items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-white/80 active:bg-white/10"
        onPointerDown={startUnlockHold}
        onPointerUp={cancelUnlockHold}
        onPointerCancel={cancelUnlockHold}
        onPointerLeave={cancelUnlockHold}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
            startUnlockHold(event);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") cancelUnlockHold();
        }}
        onBlur={cancelUnlockHold}
        aria-label="Hold for 1.5 seconds to unlock the screen"
      >
        <FiUnlock className={isHolding ? "text-white" : "text-white/60"} />
        {isHolding ? "Keep holding..." : "Hold to unlock"}
      </button>
    </div>
  );
}
