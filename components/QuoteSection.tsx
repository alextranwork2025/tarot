import { Reveal } from "@/components/Reveal";
import { SacredGeometry } from "@/components/SacredGeometry";

export function QuoteSection() {
  return (
    <section className="relative overflow-hidden border-y border-gilded/30 bg-[linear-gradient(135deg,rgba(113,31,48,0.62),rgba(9,11,16,0.95)_55%,rgba(23,75,72,0.36))] py-24">
      <SacredGeometry variant="moon" className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 text-antique-gold/10" />
      <Reveal className="relative mx-auto max-w-5xl px-5 text-center md:px-8">
        <p className="font-serif text-3xl font-semibold leading-snug text-ivory md:text-5xl">
          “Không phải mọi bóng tối đều cần bị xua tan. Có những bóng tối cần được lắng nghe.”
        </p>
      </Reveal>
    </section>
  );
}
