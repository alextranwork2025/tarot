import { Reveal } from "@/components/Reveal";
import { SacredGeometry } from "@/components/SacredGeometry";

export function QuoteSection() {
  return (
    <section className="fox-banner relative overflow-hidden border-y border-gilded/30 py-24">
      <SacredGeometry variant="moon" className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 text-antique-gold/10" />
      <Reveal className="relative mx-auto max-w-5xl px-5 text-center md:px-8">
        <p className="font-serif text-3xl font-semibold leading-snug text-ivory md:text-5xl">
          “Không phải mọi bóng tối đều cần bị xua tan. Có những bóng tối cần được lắng nghe.”
        </p>
      </Reveal>
    </section>
  );
}
