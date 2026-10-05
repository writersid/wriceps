import { ImageResponse } from "next/og";
import { CHALK, CHARCOAL, LIME } from "./fonts";

// The Wriceps icon: a chalk bar on charcoal with two lime plates on each side,
// inner plates shorter. Measured on a 32-unit grid.
// The favicon is a rounded square with wider plates, to read at tab size. The
// app icon is a full square, because iPhones round it themselves and turn
// transparent corners black.
export function brandIcon(size: number, { rounded, plateWidth }: { rounded: boolean; plateWidth: number }) {
  const u = size / 32;
  const plate = (left: number, height: number) => (
    <div
      style={{
        position: "absolute",
        left: left * u,
        top: (size - height * u) / 2,
        width: plateWidth * u,
        height: height * u,
        borderRadius: u,
        background: LIME,
      }}
    />
  );
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
        {plate(9 - plateWidth, 18)}
        {plate(10, 12)}
        {plate(22 - plateWidth, 12)}
        {plate(23, 18)}
      </div>
    ),
    { width: size, height: size },
  );
}
