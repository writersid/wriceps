import { ImageResponse } from "next/og";
import { CHALK, CHARCOAL, LIME, MUTED, VIOLET, fonts } from "./brand/fonts";

export const alt = "Wriceps: short writing workouts. Build your writing muscles.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The score meter's four plates (app/components/score-card.tsx), three times the size.
const PLATE_HEIGHTS = [96, 108, 132, 156];

// The link preview card for WhatsApp and social sites. Always light.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          padding: 72,
          background: CHALK,
          color: CHARCOAL,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 580,
          }}
        >
          <div style={{ fontFamily: "Fraunces", fontWeight: 900, fontSize: 48 }}>wriceps</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: 3,
                color: VIOLET,
              }}
            >
              SHORT WRITING WORKOUTS
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: "Fraunces",
                fontWeight: 900,
                fontSize: 88,
                lineHeight: 1.02,
              }}
            >
              Build your writing muscles.
            </div>
          </div>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: MUTED }}>
            www.wriceps.com
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", width: 440 }}>
          <div style={{ width: 60, height: 12, borderRadius: 6, background: CHARCOAL }} />
          {PLATE_HEIGHTS.map((height) => (
            <div
              key={height}
              style={{
                marginLeft: 18,
                width: 60,
                height,
                borderRadius: 18,
                border: `6px solid ${CHARCOAL}`,
                background: LIME,
              }}
            />
          ))}
          <div
            style={{ marginLeft: 18, flex: 1, height: 12, borderRadius: 6, background: CHARCOAL }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
