import { PageTransition } from "@/components/animation/page-transition";

/**
 * `template.tsx` her gezinmede yeniden monte edilir; sayfa geçiş animasyonu
 * bu sayede her rota değişiminde tekrar oynar.
 */
export default function SiteTemplate({ children }: LayoutProps<"/">) {
  return <PageTransition>{children}</PageTransition>;
}
