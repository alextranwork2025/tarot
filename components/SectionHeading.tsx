type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={`mx-auto max-w-3xl ${align === "center" ? "text-center" : "text-left"}`}>
      {eyebrow ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-antique-gold">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-4xl font-semibold leading-tight text-ivory md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-8 text-stone-mist md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
