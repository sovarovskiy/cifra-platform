import Link from "next/link";
import { Home } from "lucide-react";

export function HomeButton() {
  return (
    <Link href="/" className="btn-home">
      <Home size={16} strokeWidth={2} aria-hidden />
      Домой
    </Link>
  );
}
