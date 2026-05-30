import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;
};

export function SalesModelNavLink({ href, title, subtitle, meta }: Props) {
  return (
    <Link href={href} className="menu-item">
      <span className="menu-item-text">
        {meta && <span className="menu-item-desc">{meta}</span>}
        <span className="menu-item-title">{title}</span>
        {subtitle && <span className="menu-item-desc">{subtitle}</span>}
      </span>
      <ChevronRight size={20} strokeWidth={2} aria-hidden className="shrink-0 opacity-90" />
    </Link>
  );
}
