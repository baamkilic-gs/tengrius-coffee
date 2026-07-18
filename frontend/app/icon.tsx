import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#241b14",
          borderRadius: 7,
        }}
      >
        <svg width="23" height="23" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="7.5" fill="#e0955c" />
          <g stroke="#e0955c" strokeWidth="3.4" strokeLinecap="round">
            <line x1="20" y1="2" x2="20" y2="8.5" />
            <line x1="20" y1="31.5" x2="20" y2="38" />
            <line x1="2" y1="20" x2="8.5" y2="20" />
            <line x1="31.5" y1="20" x2="38" y2="20" />
            <line x1="7" y1="7" x2="11.5" y2="11.5" />
            <line x1="28.5" y1="28.5" x2="33" y2="33" />
            <line x1="7" y1="33" x2="11.5" y2="28.5" />
            <line x1="28.5" y1="11.5" x2="33" y2="7" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
