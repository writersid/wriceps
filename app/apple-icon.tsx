import { brandIcon } from "./brand/barbell-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return brandIcon(180, { rounded: false, plateWidth: 3 });
}
