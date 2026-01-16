import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "VERBUM - High Velocity Scripture Engine";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  // We use standard fonts to ensure 100% reliability (no fetching errors)
  // The 'monospace' look fits the terminal aesthetic perfectly.

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b", // zinc-950
          fontFamily: "monospace", // Reliable system font
          position: "relative",
        }}
      >
        {/* --- Background Layers --- */}

        {/* 1. Grid Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "radial-gradient(circle at 2px 2px, #27272a 1px, transparent 0)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
          }}
        />

        {/* 2. Central Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at center, rgba(244, 63, 94, 0.1) 0%, rgba(9, 9, 11, 0) 60%)",
          }}
        />

        {/* --- HUD Elements --- */}

        {/* Crosshair Lines */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "600px", // Center
            width: "1px",
            backgroundColor: "#f43f5e",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "315px", // Center
            height: "1px",
            backgroundColor: "#27272a",
            opacity: 0.5,
          }}
        />

        {/* Corners */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            borderTop: "2px solid #3f3f46",
            borderLeft: "2px solid #3f3f46",
            width: 40,
            height: 40,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            borderTop: "2px solid #3f3f46",
            borderRight: "2px solid #3f3f46",
            width: 40,
            height: 40,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            borderBottom: "2px solid #3f3f46",
            borderLeft: "2px solid #3f3f46",
            width: 40,
            height: 40,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            borderBottom: "2px solid #3f3f46",
            borderRight: "2px solid #3f3f46",
            width: 40,
            height: 40,
          }}
        />

        {/* --- Main Content --- */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
            paddingBottom: 20,
          }}
        >
          {/* Top Pill */}
          <div
            style={{
              display: "flex",
              marginBottom: 30,
              border: "1px solid #3f3f46",
              padding: "8px 20px",
              borderRadius: 50,
              backgroundColor: "#09090b",
              color: "#a1a1aa",
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Scripture Engine
          </div>

          {/* THE WORD - RSVP STYLE */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 140,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -5,
            }}
          >
            {/* Left */}
            <span style={{ color: "#3f3f46" }}>VE</span>

            {/* Center (Red + Glow) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "#f43f5e",
                position: "relative",
                margin: "0 5px",
              }}
            >
              R{/* Decorative mark under letter */}
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  width: 8,
                  height: 8,
                  backgroundColor: "#f43f5e",
                  borderRadius: "50%",
                }}
              />
            </div>

            {/* Right */}
            <span style={{ color: "#e4e4e7" }}>BUM</span>
          </div>

          {/* Stats Row */}
          <div
            style={{
              marginTop: 50,
              display: "flex",
              gap: 30,
              color: "#52525b",
              fontSize: 20,
              letterSpacing: 2,
            }}
          >
            <span style={{ color: "#f43f5e" }}>● LIVE</span>
            <span>700 WPM</span>
            <span>FOCUS_LOCK</span>
          </div>
        </div>

        {/* Version Number */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            color: "#27272a",
            fontSize: 14,
            letterSpacing: 2,
          }}
        >
          SYS.VER.1.0
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
