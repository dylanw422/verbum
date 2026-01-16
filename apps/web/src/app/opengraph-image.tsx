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
  // Load a Google Font for that crisp, technical look
  // (JetBrains Mono is perfect for this aesthetic)
  const fontData = await fetch(
    new URL(
      "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnF8RD8yKxTOlOV.woff2",
      import.meta.url
    )
  ).then((res) => res.arrayBuffer());

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
          fontFamily: '"JetBrains Mono"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* --- Background Layers --- */}

        {/* 1. Subtle Noise/Grid Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 1px 1px, #27272a 1px, transparent 0)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.3,
          }}
        />

        {/* 2. Dramatic Radial Glow (The "Soul" of the machine) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(244, 63, 94, 0.15) 0%, rgba(9, 9, 11, 0) 70%)",
          }}
        />

        {/* 3. Vignette to darken edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 40%, #09090b 100%)",
          }}
        />

        {/* --- HUD / Technical Overlay Elements --- */}

        {/* Top Left Marker */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ width: 40, height: 2, backgroundColor: "#f43f5e" }} />
          <div style={{ fontSize: 14, color: "#52525b", letterSpacing: "0.2em" }}>SYS.READY</div>
        </div>

        {/* Top Right Marker */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <div
            style={{ width: 10, height: 10, border: "2px solid #27272a", borderRadius: "50%" }}
          />
          <div style={{ fontSize: 14, color: "#52525b" }}>V1.0.4</div>
        </div>

        {/* Center Vertical Guide Line (The Optical Axis) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: "1px",
            backgroundColor: "#f43f5e",
            opacity: 0.2,
          }}
        />

        {/* Horizontal Guide Line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: "1px",
            backgroundImage: "linear-gradient(to right, transparent, #27272a, transparent)",
            opacity: 0.5,
          }}
        />

        {/* --- MAIN CONTENT: The RSVP Simulation --- */}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
          {/* The "Logo" Mark above text */}
          <div
            style={{
              display: "flex",
              marginBottom: 40,
              border: "1px solid #3f3f46",
              padding: "8px 16px",
              borderRadius: 99,
              backgroundColor: "rgba(9,9,11,0.8)",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#a1a1aa",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Optical Scripture Engine
            </div>
          </div>

          {/* THE WORD (Mimicking the RSVP Reader Logic) */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 130,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            {/* Left Side (Ghosted) */}
            <span style={{ color: "#52525b", opacity: 0.5, marginRight: 2 }}>VE</span>

            {/* Center Pivot (Highlighted & Glowing) */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f43f5e",
              }}
            >
              R{/* Bloom effect behind the letter */}
              <div
                style={{
                  position: "absolute",
                  width: "120%",
                  height: "120%",
                  background: "#f43f5e",
                  filter: "blur(40px)",
                  opacity: 0.4,
                  zIndex: -1,
                }}
              />
            </div>

            {/* Right Side (Bright White) */}
            <span style={{ color: "#e4e4e7", marginLeft: 2 }}>BUM</span>
          </div>

          {/* Sub-data under the word */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              gap: 40,
              color: "#71717a",
              fontSize: 18,
              letterSpacing: "0.1em",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{ width: 6, height: 6, backgroundColor: "#f43f5e", borderRadius: "50%" }}
              />
              <span>RSVP MODE</span>
            </div>
            <div>//</div>
            <div>700 WPM</div>
            <div>//</div>
            <div>FOCUS_LOCK</div>
          </div>
        </div>

        {/* Bottom Bar decoration */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            width: "80%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #27272a",
            paddingTop: 20,
          }}
        >
          <div style={{ fontSize: 14, color: "#3f3f46" }}>READ FASTER. RETAIN MORE.</div>
          {/* Fake barcode/data graphic */}
          <div style={{ display: "flex", gap: 4, height: 12, alignItems: "center" }}>
            {[10, 20, 15, 25, 10, 30, 15, 10, 20, 10].map((h, i) => (
              <div key={i} style={{ width: 2, height: h, backgroundColor: "#3f3f46" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "JetBrains Mono",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
