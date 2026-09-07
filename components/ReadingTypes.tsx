import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/services/ServiceCard";
import { getActiveServices } from "@/lib/queries/services";

export async function ReadingTypes() {
  const services = await getActiveServices();

  return (
    <section id="readings" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Dịch vụ"
            title="Ba nhịp mở lá"
            description="Chọn một hình thức đủ gần với câu hỏi hiện tại. Mỗi trải bài là một không gian quan sát, không phải lời phán quyết."
          />
        </Reveal>
        {services.length === 0 ? (
          <section className="mt-14 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-center text-stone-mist">
            Dịch vụ đang được chuẩn bị.
          </section>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {services.slice(0, 3).map((service, index) => (
              <Reveal key={service.id} delay={index * 0.08}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
