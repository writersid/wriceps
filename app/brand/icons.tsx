import { ImageResponse } from "next/og";
import { CHALK, CHARCOAL, CORAL_ON_CHARCOAL, LIME, fonts } from "./fonts";

// TEMPORARY: two icon candidates for Sid to compare at /icon-b and /icon-c.
// The winner moves to app/icon.tsx and app/apple-icon.tsx; the rest is removed.

// The favicon is a rounded square. The app icon is a full square, because
// iPhones round it themselves and turn transparent corners black.
function frame(size: number, rounded: boolean, children: React.ReactNode) {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          borderRadius: rounded ? size * 0.22 : 0,
          background: CHARCOAL,
        }}
      >
        {children}
      </div>
    ),
    { width: size, height: size, fonts },
  );
}

// B: a chalk bar with two lime plates on each side, inner plates shorter.
export function iconB(size: number, rounded: boolean) {
  const u = size / 32;
  const plate = (left: number, height: number) => (
    <div
      style={{
        position: "absolute",
        left: left * u,
        top: (size - height * u) / 2,
        width: 3 * u,
        height: height * u,
        borderRadius: u,
        background: LIME,
      }}
    />
  );
  return frame(
    size,
    rounded,
    <>
      <div
        style={{
          position: "absolute",
          left: 3 * u,
          top: 15 * u,
          width: 26 * u,
          height: 2 * u,
          borderRadius: u,
          background: CHALK,
        }}
      />
      {plate(6, 18)}
      {plate(10, 12)}
      {plate(19, 12)}
      {plate(23, 18)}
    </>,
  );
}

// C: a chalk "w" with a coral wavy underline.
export function iconC(size: number, rounded: boolean) {
  const u = size / 32;
  return frame(
    size,
    rounded,
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          marginTop: -3 * u,
          fontFamily: "Fraunces",
          fontWeight: 900,
          fontSize: 24 * u,
          lineHeight: 0.8,
          color: CHALK,
        }}
      >
        w
      </div>
      <svg width={22 * u} height={5 * u} viewBox="0 0 46 10" style={{ marginTop: 2.5 * u }}>
        <path
          d="M3 5 Q8 0 13 5 T23 5 T33 5 T43 5"
          fill="none"
          stroke={CORAL_ON_CHARCOAL}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>,
  );
}
