import { ICON_BG, ICON_CHART } from "@/lib/brand-icon";

type Props = {
  size?: number;
  className?: string;
  /** false — только график без светлого квадрата (для тёмного фона) */
  withBackground?: boolean;
};

/** Логотип приложения: столбчатая диаграмма с линией тренда */
export function BrandLogo({
  size = 40,
  className = "",
  withBackground = true,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Цифра"
    >
      {withBackground && (
        <rect width="512" height="512" rx="112" fill={ICON_BG} />
      )}
      <path
        d="M 72 392 C 168 332, 296 276, 432 208"
        stroke="white"
        strokeWidth="52"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="104" y="328" width="48" height="88" rx="24" fill={ICON_CHART} />
      <rect x="168" y="288" width="48" height="128" rx="24" fill={ICON_CHART} />
      <rect x="232" y="248" width="48" height="168" rx="24" fill={ICON_CHART} />
      <rect x="296" y="204" width="48" height="212" rx="24" fill={ICON_CHART} />
      <rect x="360" y="160" width="48" height="256" rx="24" fill={ICON_CHART} />
      <path
        d="M 128 360 L 192 316 L 256 276 L 320 232 L 384 184"
        stroke={ICON_CHART}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 368 168 L 404 168 L 388 200 Z"
        fill={ICON_CHART}
      />
    </svg>
  );
}

/** То же SVG для next/og ImageResponse (иконки PWA) */
export function BrandLogoOg({ size = 512 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
      >
        <rect width="512" height="512" rx="112" fill={ICON_BG} />
        <path
          d="M 72 392 C 168 332, 296 276, 432 208"
          stroke="white"
          strokeWidth="52"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="104" y="328" width="48" height="88" rx="24" fill={ICON_CHART} />
        <rect x="168" y="288" width="48" height="128" rx="24" fill={ICON_CHART} />
        <rect x="232" y="248" width="48" height="168" rx="24" fill={ICON_CHART} />
        <rect x="296" y="204" width="48" height="212" rx="24" fill={ICON_CHART} />
        <rect x="360" y="160" width="48" height="256" rx="24" fill={ICON_CHART} />
        <path
          d="M 128 360 L 192 316 L 256 276 L 320 232 L 384 184"
          stroke={ICON_CHART}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M 368 168 L 404 168 L 388 200 Z" fill={ICON_CHART} />
      </svg>
    </div>
  );
}
