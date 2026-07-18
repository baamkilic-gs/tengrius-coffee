import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #241b14 0%, #2f2318 55%, #180f09 100%)",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="7" fill="#e0955c" />
          <g stroke="#e0955c" strokeWidth="2.4" strokeLinecap="round">
            <line x1="20" y1="2.5" x2="20" y2="9" />
            <line x1="20" y1="31" x2="20" y2="37.5" />
            <line x1="2.5" y1="20" x2="9" y2="20" />
            <line x1="31" y1="20" x2="37.5" y2="20" />
            <line x1="7.6" y1="7.6" x2="12.2" y2="12.2" />
            <line x1="27.8" y1="27.8" x2="32.4" y2="32.4" />
            <line x1="7.6" y1="32.4" x2="12.2" y2="27.8" />
            <line x1="27.8" y1="12.2" x2="32.4" y2="7.6" />
          </g>
        </svg>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 30 }}>
          <span style={{ fontSize: 78, fontWeight: 700, color: "#e0955c", letterSpacing: "-0.02em" }}>
            Tengrius
          </span>
          <span style={{ fontSize: 32, color: "rgba(253,251,247,0.6)" }}>Kahve Borsası</span>
        </div>
        <div style={{ display: "flex", marginTop: 22 }}>
          <span style={{ fontSize: 30, color: "#fdfbf7", letterSpacing: "0.06em" }}>
            Çiğ Kahve Pazar Yeri
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
