import { ImageResponse } from "next/og";
import { BrandLogoOg } from "@/components/BrandLogo";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandLogoOg size={512} />, { ...size });
}
