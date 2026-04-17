import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react";

/**
 * IosInstallPrompt
 *
 * Shows a non-intrusive bottom sheet on iPhone/iPad Safari when the app
 * is NOT already installed (i.e. not running in standalone mode).
 * Dismissed state is persisted in localStorage so it only shows once per session.
 */

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  // iPads on iOS 13+ report as Macintosh, so also check for touch support
  return /iphone|ipad|ipod/i.test(ua) ||
    (ua.includes("Mac") && "ontouchend" in document);
}

function isInStandaloneMode(): boolean {
  return (
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

const DISMISSED_KEY = "pwa-ios-prompt-dismissed";

export function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari, not in standalone, not previously dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (isIos() && !isInStandaloneMode() && !dismissed) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Go Study! on your iPhone"
      style={{
        position: "fixed",
        bottom: "env(safe-area-inset-bottom, 16px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 420,
        zIndex: 9999,
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "16px 16px 20px",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <img
            src="/apple-touch-icon.png"
            alt="Go Study! icon"
            style={{ width: 44, height: 44, borderRadius: 10, marginRight: 12, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>
              Install Go Study!
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
              Add to your Home Screen for the best experience
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            style={{
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              color: "#9ca3af",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <ol style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
          <Step n={1} icon={<Share size={16} style={{ color: "#6366f1" }} />}>
            Tap the <strong>Share</strong> button{" "}
            <span style={{ fontSize: 13 }}>
              (<Share size={12} style={{ display: "inline", verticalAlign: "middle" }} /> in Safari's toolbar)
            </span>
          </Step>
          <Step n={2} icon={<PlusSquare size={16} style={{ color: "#6366f1" }} />}>
            Scroll down and tap <strong>"Add to Home Screen"</strong>
          </Step>
          <Step n={3} icon={<span style={{ fontSize: 14 }}>✓</span>}>
            Tap <strong>"Add"</strong> — done!
          </Step>
        </ol>

        {/* Arrow pointing down toward Safari toolbar */}
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "10px solid rgba(255,255,255,0.96)",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.08))",
          }}
        />
      </div>
    </div>
  );
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "6px 0",
        fontSize: 13,
        color: "#374151",
        borderBottom: n < 3 ? "1px solid #f3f4f6" : "none",
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#ede9fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 700,
          color: "#6366f1",
        }}
      >
        {n}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {icon} {children}
      </span>
    </li>
  );
}
