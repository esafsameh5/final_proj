import React from "react";

export default function LoginLoadingOverlay({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--primary, #0b3d91)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        animation: "overlayFadeIn 0.25s ease-out forwards",
        pointerEvents: "auto",
      }}
    >
      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spinnerRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Outer circular spinner container holding the logo in absolute center */}
      <div
        style={{
          position: "relative",
          width: "280px",
          height: "280px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Spinner ring running around the logo */}
        <div
          style={{
            position: "absolute",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            border: "4px solid rgba(255, 255, 255, 0.1)",
            borderTop: "4px solid rgba(255, 255, 255, 0.9)",
            borderRight: "4px solid rgba(255, 255, 255, 0.4)",
            animation: "spinnerRotate 1.2s linear infinite",
          }}
        />

        {/* Official Logo centered inside the spinner ring */}
        <img
          alt="Smart Health Logo"
          src="/img/main_logo.png"
          style={{
            width: "150px",
            height: "150px",
            objectContain: "contain",
            zIndex: 10,
          }}
        />
      </div>

      <div style={{ marginTop: "20px", textAlign: "center", direction: "rtl" }}>
        <h2
          style={{
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: "700",
            margin: "0 0 8px 0",
            fontFamily: "'Readex Pro', 'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          جارٍ تسجيل الدخول...
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "15px",
            fontWeight: "500",
            margin: "0",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          يرجى الانتظار
        </p>
      </div>
    </div>
  );
}
