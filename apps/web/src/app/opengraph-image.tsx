import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "VERBUM - Scripture Engine";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  // We can load fonts here if needed, but system fonts work for speed

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
          backgroundImage: "linear-gradient(to bottom, #09090b, #18181b)",
          fontFamily: "monospace",
        }}
      >
        {/* Decorative Grid Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.1,
          }}
        />

        {/* Center Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #3f3f46",
            backgroundColor: "rgba(24, 24, 27, 0.8)",
            padding: "40px 80px",
            borderRadius: "12px",
            boxShadow: "0 0 50px rgba(244, 63, 94, 0.15)", // Rose glow
          }}
        >
          {/* Logo Mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              backgroundColor: "#f43f5e", // Rose-500
              borderRadius: "4px",
              marginBottom: "30px",
              boxShadow: "0 0 30px rgba(244, 63, 94, 0.5)",
            }}
          >
            {/* Command Icon SVG */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#09090b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "white",
              lineHeight: 1,
              marginBottom: "10px",
            }}
          >
            VERBUM
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.4em",
              color: "#f43f5e", // Rose-500
              textTransform: "uppercase",
            }}
          >
            Scripture Engine
          </div>
        </div>

        {/* Footer decoration */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "#52525b",
            letterSpacing: "0.2em",
          }}
        >
          SYSTEM READY // V1.0
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
