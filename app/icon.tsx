import { brandIcon } from "./brand/barbell-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return brandIcon(32, { rounded: true, plateWidth: 4 });
}
